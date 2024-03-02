import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { setThrowInvalidWriteToSignalError } from '@angular/core/primitives/signals';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  hubConnection!: HubConnection;
    user: any;
  Messages: Message[] = [];
  msg: string = "test message";

  ngOnInit(): void {
    while (!this.user)
      this.user = prompt("enter name");
    this.hubConnection.on('Receive', (user, message) => {

      this.Messages.push(new Message(user, message));
    });


    this.hubConnection.on('ReceiveImg', (user, message) => {

      this.Messages.push(new Message(user, message, true));
    });


    this.hubConnection.start();
  }
  SendMsg() {

    this.hubConnection.invoke("Send", this.user, this.msg);
  }


  fileSelect(ev: any) {


    const file = ev.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.hubConnection.invoke("SendImg", this.user, reader.result);
    };

  }

  title = 'chatClient';

  constructor() {
    this.hubConnection = new HubConnectionBuilder().withUrl("https://localhost:7216/mychat")
      .withAutomaticReconnect()
      .withServerTimeout(1000 * 30)
      .build();
      
  }
}
export class Message {
  constructor(public UserName: string, public Text: string, public IsImage: boolean = false) {

  }
}
