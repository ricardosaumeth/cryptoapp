import type { ConnectionProxy } from "./types/ConnectionProxy"

export class WsConnectionProxy implements ConnectionProxy {
  private socket?: WebSocket
  private onConnectFn?: () => void
  private onReceivedFn?: (data?: any) => void
  private onErrorFn?: (error: any) => void
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
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts)
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
    if (this.socket) {
      this.socket.send(message)
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
}
