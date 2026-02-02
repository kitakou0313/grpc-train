import * as grpc from "@grpc/grpc-js";
import { MyServiceService, IMyServiceServer } from "./generated/service_grpc_pb";
import { 
    HelloRequest,
    HelloResponse,
    ListUsersRequest,
    UserResponse,
    ChatMessage,
    MessageSummary
 } from "./generated/service_pb";


 const myServiceImpl: IMyServiceServer = {
    sayHello: (
        call: grpc.ServerUnaryCall<HelloRequest, HelloResponse>,
        callback: grpc.sendUnaryData<HelloResponse>
    ) => {
        console.log('[Unary] SayHello が呼び出されました');

        const name = call.request.getName();

        const response = new HelloResponse();
        response.setMessage(`こんにちは, ${name}`)

        callback(null, response);
        console.log(`[Unary] レスポンスを送信`)
    }
 }