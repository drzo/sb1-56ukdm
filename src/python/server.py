import websockets
import json
import sys
import os
from concurrent.futures import ThreadPoolExecutor

class HyperonServer:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        
    async def handle_message(self, websocket, path):
        try:
            async for message in websocket:
                data = json.loads(message)
                command = data.get('command')
                params = data.get('params', {})
                request_id = data.get('requestId')
                
                response = {
                    'status': 'success',
                    'data': await self.process_command(command, params),
                    'requestId': request_id
                }
                
                await websocket.send(json.dumps(response))
        except Exception as e:
            print(f"Error handling message: {str(e)}", file=sys.stderr)
            response = {
                'status': 'error',
                'message': str(e),
                'requestId': request_id
            }
            await websocket.send(json.dumps(response))

    async def process_command(self, command, params):
        # Simplified command processing for browser environment
        if command == 'query':
            return {'result': 'Query processed'}
        elif command == 'add_atom':
            return {'result': 'Atom added'}
        elif command == 'get_atom':
            return {'result': 'Atom retrieved'}
        else:
            raise ValueError(f"Unknown command: {command}")

async def main():
    server = HyperonServer()
    async with websockets.serve(server.handle_message, "localhost", 8765):
        print("Python server running on ws://localhost:8765")
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    try:
        import asyncio
        asyncio.run(main())
    except ImportError:
        print("Running in limited mode without asyncio")
        # Fallback to basic HTTP server if asyncio is not available
        from http.server import HTTPServer, SimpleHTTPRequestHandler
        httpd = HTTPServer(('localhost', 8765), SimpleHTTPRequestHandler)
        print("Python HTTP server running on http://localhost:8765")
        httpd.serve_forever()