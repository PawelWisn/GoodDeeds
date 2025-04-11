const WebSocketManager = (() => {
	const connections: Set<WebSocket> = new Set();

	return {
		addConnection: (ws: WebSocket) => {
			connections.add(ws);
		},
		removeConnection: (ws: WebSocket) => {
			connections.delete(ws);
		},
		closeAllConnections: () => {
			connections.forEach((ws) => {
				if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
					ws.close();
				}
			});
			connections.clear();
		},
	};
})();

export default WebSocketManager;
