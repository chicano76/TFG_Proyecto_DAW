import { Injectable, signal } from '@angular/core';

export interface Notification {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    id: number;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    notifications = signal<Notification[]>([]);
    private counter = 0;

    show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
        const id = this.counter++;
        const notification: Notification = { message, type, id };

        this.notifications.update(nots => [...nots, notification]);

        
        setTimeout(() => {
            this.remove(id);
        }, 5000);
    }

    success(message: string) {
        this.show(message, 'success');
    }

    error(message: string) {
        this.show(message, 'error');
    }

    warning(message: string) {
        this.show(message, 'warning');
    }

    remove(id: number) {
        this.notifications.update(nots => nots.filter(n => n.id !== id));
    }
}
