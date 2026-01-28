// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('@grpc/grpc-js');
var service_pb = require('./service_pb.js');

function serialize_myservice_ChatMessage(arg) {
  if (!(arg instanceof service_pb.ChatMessage)) {
    throw new Error('Expected argument of type myservice.ChatMessage');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_myservice_ChatMessage(buffer_arg) {
  return service_pb.ChatMessage.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_myservice_HelloRequest(arg) {
  if (!(arg instanceof service_pb.HelloRequest)) {
    throw new Error('Expected argument of type myservice.HelloRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_myservice_HelloRequest(buffer_arg) {
  return service_pb.HelloRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_myservice_HelloResponse(arg) {
  if (!(arg instanceof service_pb.HelloResponse)) {
    throw new Error('Expected argument of type myservice.HelloResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_myservice_HelloResponse(buffer_arg) {
  return service_pb.HelloResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_myservice_ListUsersRequest(arg) {
  if (!(arg instanceof service_pb.ListUsersRequest)) {
    throw new Error('Expected argument of type myservice.ListUsersRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_myservice_ListUsersRequest(buffer_arg) {
  return service_pb.ListUsersRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_myservice_MessageSummary(arg) {
  if (!(arg instanceof service_pb.MessageSummary)) {
    throw new Error('Expected argument of type myservice.MessageSummary');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_myservice_MessageSummary(buffer_arg) {
  return service_pb.MessageSummary.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_myservice_UserResponse(arg) {
  if (!(arg instanceof service_pb.UserResponse)) {
    throw new Error('Expected argument of type myservice.UserResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_myservice_UserResponse(buffer_arg) {
  return service_pb.UserResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


// =====================================================
// gRPC 4つの通信パターンを学ぶためのサービス定義
// =====================================================
//
var MyServiceService = exports.MyServiceService = {
  // 1. Unary RPC（単項RPC）
//    最も基本的なパターン。1リクエスト → 1レスポンス。
//    HTTP の GET/POST に最も近いイメージ。
sayHello: {
    path: '/myservice.MyService/SayHello',
    requestStream: false,
    responseStream: false,
    requestType: service_pb.HelloRequest,
    responseType: service_pb.HelloResponse,
    requestSerialize: serialize_myservice_HelloRequest,
    requestDeserialize: deserialize_myservice_HelloRequest,
    responseSerialize: serialize_myservice_HelloResponse,
    responseDeserialize: deserialize_myservice_HelloResponse,
  },
  // 2. Server Streaming RPC（サーバーストリーミング）
//    1リクエスト → 複数レスポンス（サーバーが逐次送信）。
//    大量データの段階的な配信や、リアルタイム通知に適している。
listUsers: {
    path: '/myservice.MyService/ListUsers',
    requestStream: false,
    responseStream: true,
    requestType: service_pb.ListUsersRequest,
    responseType: service_pb.UserResponse,
    requestSerialize: serialize_myservice_ListUsersRequest,
    requestDeserialize: deserialize_myservice_ListUsersRequest,
    responseSerialize: serialize_myservice_UserResponse,
    responseDeserialize: deserialize_myservice_UserResponse,
  },
  // 3. Client Streaming RPC（クライアントストリーミング）
//    複数リクエスト → 1レスポンス（クライアントが逐次送信）。
//    ファイルアップロードやバッチデータの送信に適している。
recordMessages: {
    path: '/myservice.MyService/RecordMessages',
    requestStream: true,
    responseStream: false,
    requestType: service_pb.ChatMessage,
    responseType: service_pb.MessageSummary,
    requestSerialize: serialize_myservice_ChatMessage,
    requestDeserialize: deserialize_myservice_ChatMessage,
    responseSerialize: serialize_myservice_MessageSummary,
    responseDeserialize: deserialize_myservice_MessageSummary,
  },
  // 4. Bidirectional Streaming RPC（双方向ストリーミング）
//    複数リクエスト ↔ 複数レスポンス（双方が自由に送受信）。
//    リアルタイムチャットやゲームの通信に適している。
chat: {
    path: '/myservice.MyService/Chat',
    requestStream: true,
    responseStream: true,
    requestType: service_pb.ChatMessage,
    responseType: service_pb.ChatMessage,
    requestSerialize: serialize_myservice_ChatMessage,
    requestDeserialize: deserialize_myservice_ChatMessage,
    responseSerialize: serialize_myservice_ChatMessage,
    responseDeserialize: deserialize_myservice_ChatMessage,
  },
};

exports.MyServiceClient = grpc.makeGenericClientConstructor(MyServiceService, 'MyService');
