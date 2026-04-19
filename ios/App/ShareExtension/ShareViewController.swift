//
//  ShareViewController.swift
//  ShareExtension
//
//  Created by Tom Fong on 17/4/2026.
//

import UIKit
import MobileCoreServices
import UniformTypeIdentifiers

class ShareViewController: UIViewController {

    private let appGroupId = "group.com.tomfong.simpleqr"
    private let urlScheme = "simpleqr://scan-image?id="

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
        handleSharedImage()
    }

    private func setupUI() {
        view.backgroundColor = UIColor(white: 0, alpha: 0.4)

        containerView.backgroundColor = UIColor.systemBackground
        containerView.layer.cornerRadius = 16
        containerView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(containerView)

        statusLabel.text = "Processing image..."
        statusLabel.textAlignment = .center
        statusLabel.font = .systemFont(ofSize: 16, weight: .medium)
        statusLabel.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(statusLabel)

        activityIndicator.startAnimating()
        activityIndicator.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(activityIndicator)

        cancelButton.setTitle("Cancel", for: .normal)
        cancelButton.addTarget(self, action: #selector(cancelTapped), for: .touchUpInside)
        cancelButton.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(cancelButton)

        NSLayoutConstraint.activate([
            containerView.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            containerView.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            containerView.widthAnchor.constraint(equalToConstant: 280),
            containerView.heightAnchor.constraint(equalToConstant: 160),

            statusLabel.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 24),
            statusLabel.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 16),
            statusLabel.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: -16),

            activityIndicator.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            activityIndicator.topAnchor.constraint(equalTo: statusLabel.bottomAnchor, constant: 16),

            cancelButton.centerXAnchor.constraint(equalTo: containerView.centerXAnchor),
            cancelButton.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: -16)
        ])
    }

    @objc private func cancelTapped() {
        self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
    }

    private func handleSharedImage() {
        guard let extensionItems = extensionContext?.inputItems as? [NSExtensionItem] else {
            completeWithError("No items found")
            return
        }

        for item in extensionItems {
            guard let attachments = item.attachments else { continue }
            for provider in attachments {
                if provider.hasItemConformingToTypeIdentifier(UTType.image.identifier) {
                    processImage(provider: provider)
                    return
                }
            }
        }
        completeWithError("No image found")
    }

    private func processImage(provider: NSItemProvider) {
        provider.loadItem(forTypeIdentifier: UTType.image.identifier, options: nil) { [weak self] item, error in
            guard let self = self else { return }
            DispatchQueue.main.async {
                if let error = error {
                    self.completeWithError("Failed to load image: \(error.localizedDescription)")
                    return
                }
                var imageData: Data?
                if let url = item as? URL {
                    imageData = try? Data(contentsOf: url)
                } else if let data = item as? Data {
                    imageData = data
                } else if let image = item as? UIImage {
                    imageData = image.jpegData(compressionQuality: 0.9)
                }
                guard let data = imageData else {
                    self.completeWithError("Could not read image data")
                    return
                }
                self.saveAndOpen(data: data)
            }
        }
    }

    private func saveAndOpen(data: Data) {
        guard let containerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId) else {
            completeWithError("Could not access app group")
            return
        }

        let imagesDir = containerURL.appendingPathComponent("SharedImages", isDirectory: true)

        do {
            try FileManager.default.createDirectory(at: imagesDir, withIntermediateDirectories: true)
        } catch {
            completeWithError("Could not create directory")
            return
        }

        let filename = UUID().uuidString + ".jpg"
        let fileURL = imagesDir.appendingPathComponent(filename)

        do {
            try data.write(to: fileURL)
        } catch {
            completeWithError("Could not save image")
            return
        }

        statusLabel.text = "Opening Simple QR..."

        guard let url = URL(string: urlScheme + filename) else {
            completeWithError("Could not create URL")
            return
        }

        var responder: UIResponder? = self
        var succeeded = false
        while responder != nil {
            if let application = responder as? UIApplication {
                application.open(url, options: [:], completionHandler: nil)
                succeeded = true
                break
            }
            responder = responder?.next
        }

        if !succeeded {
            if let urlToOpen = URL(string: "simpleqr://") {
                self.extensionContext?.open(urlToOpen, completionHandler: { _ in })
            }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
            self.extensionContext?.completeRequest(returningItems: [], completionHandler: nil)
        }
    }

    private func completeWithError(_ message: String) {
        statusLabel.text = message
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            self.extensionContext?.cancelRequest(withError: NSError(domain: "com.tomfong.simpleqr.share", code: 1, userInfo: [NSLocalizedDescriptionKey: message]))
        }
    }
}
