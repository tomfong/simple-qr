import { trigger, transition, style, animate, state } from "@angular/animations";

export const fadeIn = trigger('inAnimation', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('1s ease-out', style({ opacity: 1 }))
    ])
])

export const fastFadeIn = trigger('fastInAnimation', [
    transition(':enter', [
        style({ opacity: 0 }),
        animate('.5s ease', style({ opacity: 1 }))
    ])
])

export const fadeOut = trigger('outAnimation', [
    transition(':leave', [
        style({ opacity: 1 }),
        animate('.3s ease', style({ opacity: 0 }))
    ])
])

export const flyOut = trigger('flyOut', [
    transition(':leave', [
        style({ opacity: 1 }),
        animate('{{duration}}ms ease-in', style({ transform: 'translateX(-80%)', opacity: 0 }))
    ])
])