// package: myservice
// file: service.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "@grpc/grpc-js";
import * as service_pb from "./service_pb";

interface IMyServiceService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    sayHello: IMyServiceService_ISayHello;
    listUsers: IMyServiceService_IListUsers;
    recordMessages: IMyServiceService_IRecordMessages;
    chat: IMyServiceService_IChat;
}

interface IMyServiceService_ISayHello extends grpc.MethodDefinition<service_pb.HelloRequest, service_pb.HelloResponse> {
    path: "/myservice.MyService/SayHello";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<service_pb.HelloRequest>;
    requestDeserialize: grpc.deserialize<service_pb.HelloRequest>;
    responseSerialize: grpc.serialize<service_pb.HelloResponse>;
    responseDeserialize: grpc.deserialize<service_pb.HelloResponse>;
}
interface IMyServiceService_IListUsers extends grpc.MethodDefinition<service_pb.ListUsersRequest, service_pb.UserResponse> {
    path: "/myservice.MyService/ListUsers";
    requestStream: false;
    responseStream: true;
    requestSerialize: grpc.serialize<service_pb.ListUsersRequest>;
    requestDeserialize: grpc.deserialize<service_pb.ListUsersRequest>;
    responseSerialize: grpc.serialize<service_pb.UserResponse>;
    responseDeserialize: grpc.deserialize<service_pb.UserResponse>;
}
interface IMyServiceService_IRecordMessages extends grpc.MethodDefinition<service_pb.ChatMessage, service_pb.MessageSummary> {
    path: "/myservice.MyService/RecordMessages";
    requestStream: true;
    responseStream: false;
    requestSerialize: grpc.serialize<service_pb.ChatMessage>;
    requestDeserialize: grpc.deserialize<service_pb.ChatMessage>;
    responseSerialize: grpc.serialize<service_pb.MessageSummary>;
    responseDeserialize: grpc.deserialize<service_pb.MessageSummary>;
}
interface IMyServiceService_IChat extends grpc.MethodDefinition<service_pb.ChatMessage, service_pb.ChatMessage> {
    path: "/myservice.MyService/Chat";
    requestStream: true;
    responseStream: true;
    requestSerialize: grpc.serialize<service_pb.ChatMessage>;
    requestDeserialize: grpc.deserialize<service_pb.ChatMessage>;
    responseSerialize: grpc.serialize<service_pb.ChatMessage>;
    responseDeserialize: grpc.deserialize<service_pb.ChatMessage>;
}

export const MyServiceService: IMyServiceService;

export interface IMyServiceServer extends grpc.UntypedServiceImplementation {
    sayHello: grpc.handleUnaryCall<service_pb.HelloRequest, service_pb.HelloResponse>;
    listUsers: grpc.handleServerStreamingCall<service_pb.ListUsersRequest, service_pb.UserResponse>;
    recordMessages: grpc.handleClientStreamingCall<service_pb.ChatMessage, service_pb.MessageSummary>;
    chat: grpc.handleBidiStreamingCall<service_pb.ChatMessage, service_pb.ChatMessage>;
}

export interface IMyServiceClient {
    sayHello(request: service_pb.HelloRequest, callback: (error: grpc.ServiceError | null, response: service_pb.HelloResponse) => void): grpc.ClientUnaryCall;
    sayHello(request: service_pb.HelloRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: service_pb.HelloResponse) => void): grpc.ClientUnaryCall;
    sayHello(request: service_pb.HelloRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: service_pb.HelloResponse) => void): grpc.ClientUnaryCall;
    listUsers(request: service_pb.ListUsersRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<service_pb.UserResponse>;
    listUsers(request: service_pb.ListUsersRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<service_pb.UserResponse>;
    recordMessages(callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    recordMessages(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    recordMessages(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    recordMessages(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    chat(): grpc.ClientDuplexStream<service_pb.ChatMessage, service_pb.ChatMessage>;
    chat(options: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<service_pb.ChatMessage, service_pb.ChatMessage>;
    chat(metadata: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<service_pb.ChatMessage, service_pb.ChatMessage>;
}

export class MyServiceClient extends grpc.Client implements IMyServiceClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: Partial<grpc.ClientOptions>);
    public sayHello(request: service_pb.HelloRequest, callback: (error: grpc.ServiceError | null, response: service_pb.HelloResponse) => void): grpc.ClientUnaryCall;
    public sayHello(request: service_pb.HelloRequest, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: service_pb.HelloResponse) => void): grpc.ClientUnaryCall;
    public sayHello(request: service_pb.HelloRequest, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: service_pb.HelloResponse) => void): grpc.ClientUnaryCall;
    public listUsers(request: service_pb.ListUsersRequest, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<service_pb.UserResponse>;
    public listUsers(request: service_pb.ListUsersRequest, metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientReadableStream<service_pb.UserResponse>;
    public recordMessages(callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    public recordMessages(metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    public recordMessages(options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    public recordMessages(metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: service_pb.MessageSummary) => void): grpc.ClientWritableStream<service_pb.ChatMessage>;
    public chat(options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<service_pb.ChatMessage, service_pb.ChatMessage>;
    public chat(metadata?: grpc.Metadata, options?: Partial<grpc.CallOptions>): grpc.ClientDuplexStream<service_pb.ChatMessage, service_pb.ChatMessage>;
}
