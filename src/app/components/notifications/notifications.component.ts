import { ChangeDetectorRef, Component } from '@angular/core'

import { ElectronService } from '../../core/services/electron/electron.service'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'

@Component({
	selector: 'app-notifications',
	standalone: true,
	imports: [FormsModule, CommonModule],
	templateUrl: './notifications.component.html',
	styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
	notificationTitle: string = '' // Holds the input text
	notificationBody: string = '' // Holds the input text
	showSign: boolean = false

	constructor(private electronService: ElectronService, private cdr: ChangeDetectorRef) {}

	sendNotification() {
		this.electronService.sendNotification({
			title: this.notificationTitle,
			message: this.notificationBody,
			callback: () => {
				console.log('callback')
				this.showSign = true
				this.cdr.detectChanges()
				setTimeout(() => {
					this.showSign = false
					this.cdr.detectChanges()
				}, 5000)
			},
		})
	}
}
