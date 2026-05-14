export class WsConfig {
    // 通用接口
    public static readonly COMMON = {
      PING: "PING",
      PONG: "PONG",
    };
  
    public static readonly LOADING = {
      // 握手成功主动发送服务器连接成功协议，附带sessionId
      CONNECT: "CONNECT",
      // 会话信息响应，返回sessionId
      SESSION_INFO_RESP: "SESSION_INFO_RESP",
      // 连接响应，返回用户信息和渠道信息
      CONNECT_RESP: "CONNECT_RESP",
    }
  
    // 游戏相关ws
    public static readonly GAME = {
      // 被踢下线
      KICK_OFF: "KICK_OFF",
      // 公告
      ANNOUNCEMENT: "ANNOUNCEMENT",
    };
  
    // 自定义消息
    public static readonly CUSTOM = {
  
    }
  }