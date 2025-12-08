import type { ConnectionProxy } from "./types/ConnectionProxy"

export class WsConnectionProxy implements ConnectionProxy {
  private socket?: WebSocket
  private onConnectFn?: () => void
  private onReceivedFn?: (data?: any) => void
  private onErrorFn?: (error: any) => void
  private onCloseFn?: () => void
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private shouldReconnect = true

  constructor(private realm: string) {
    this.socket = undefined
    this.onReceivedFn = undefined
  }

  start(): void {
    this.shouldReconnect = true
    this.connect()
  }

  private connect(): void {
    this.socket = new WebSocket(this.realm)

    this.socket.onopen = () => {
      this.reconnectAttempts = 0
      this.onConnectFn && this.onConnectFn()
    }

    this.socket.onmessage = ({ data }) => {
      this.onReceivedFn && this.onReceivedFn(data)
    }

    this.socket.onerror = (error) => {
      this.onErrorFn && this.onErrorFn(error)
    }

    this.socket.onclose = () => {
      this.onCloseFn && this.onCloseFn()

      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        const delay = this.reconnectDelay * this.reconnectAttempts
        console.log(`Scheduling reconnect in ${delay}ms...`)

        setTimeout(() => {
          this.connect()
          console.log("Reconnect attempt executed.")
        }, delay)
      }
    }
  }

  stop(): void {
    this.shouldReconnect = false
    if (this.socket) {
      this.socket.close()
      this.socket = undefined
    }
  }

  send(message: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message)
    } else {
      console.warn(`Fail to send message as WS is in ${this.socket?.readyState} state`)
    }
  }

  onConnect(callback: () => void): void {
    this.onConnectFn = callback
  }

  onReceived(callback: (data: any) => void): void {
    this.onReceivedFn = callback
  }

  onError(callback: (error: any) => void): void {
    this.onErrorFn = callback
  }

  onClose(callback: () => void): void {
    this.onCloseFn = callback
  }
}
