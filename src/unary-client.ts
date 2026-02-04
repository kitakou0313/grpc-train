import * as grpc from '@grpc/grpc-js'
import { MyServiceClient } from './generated/service_grpc_pb';
import {
  HelloRequest,
  ListUsersRequest,
  ChatMessage,
} from './generated/service_pb';
import { error } from 'console';

function sleep(ms:number): Promise<void> {
    return new Promise(
        (resolve) => setTimeout(resolve, ms)
    )
}

async function demoUnaryGRPC(client: MyServiceClient): Promise<void> {
    
    return new Promise((resolve, reject) => {
        const request = new HelloRequest();
        request.setName(`test user`)

        client.sayHello(request, (error, response) => {
            if (error) {
                console.log('エラー:', error)
                reject(error)
            }

            console.log(`response message:`, response.getMessage())
            resolve()
        })
    })
}

async function main() {
    // サーバーに接続
    const client = new MyServiceClient(
        'localhost:50051',
        grpc.credentials.createInsecure() // 開発用（本番では TLS を使用）
    );
}