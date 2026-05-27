import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr';

let notificationConnection: HubConnection | null = null;
let loanConnection: HubConnection | null = null;

export function connectNotificationHub(token: string): HubConnection {
  if (notificationConnection?.state === 'Connected') return notificationConnection;

  notificationConnection = new HubConnectionBuilder()
    .withUrl('/hubs/notifications', { accessTokenFactory: () => token })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  notificationConnection.start().catch(console.error);
  return notificationConnection;
}

export function connectLoanHub(token: string): HubConnection {
  if (loanConnection?.state === 'Connected') return loanConnection;

  loanConnection = new HubConnectionBuilder()
    .withUrl('/hubs/loans', { accessTokenFactory: () => token })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  loanConnection.start().catch(console.error);
  return loanConnection;
}

export function disconnectHubs(): void {
  notificationConnection?.stop();
  loanConnection?.stop();
  notificationConnection = null;
  loanConnection = null;
}
