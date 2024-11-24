export function renderHomePage() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reservoir Computing Demo</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
            line-height: 1.6;
          }
          .container {
            background: #f5f5f5;
            border-radius: 8px;
            padding: 2rem;
            margin-top: 2rem;
          }
          .status {
            color: #16a34a;
            font-weight: 500;
          }
          #reservoir {
            width: 100%;
            height: 300px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 1rem 0;
          }
          .controls {
            display: flex;
            gap: 1rem;
            margin: 1rem 0;
          }
          button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 4px;
            background: #2563eb;
            color: white;
            cursor: pointer;
          }
          button:hover {
            background: #1d4ed8;
          }
          .state-display {
            font-family: monospace;
            padding: 1rem;
            background: #1e293b;
            color: #e2e8f0;
            border-radius: 4px;
            overflow-x: auto;
          }
        </style>
      </head>
      <body>
        <h1>Reservoir Computing Demo</h1>
        <div class="container">
          <div class="controls">
            <button onclick="processInput()">Process Random Input</button>
            <button onclick="reset()">Reset</button>
          </div>
          <canvas id="reservoir"></canvas>
          <div class="state-display" id="state"></div>
        </div>

        <script>
          const canvas = document.getElementById('reservoir');
          const ctx = canvas.getContext('2d');
          const stateDisplay = document.getElementById('state');
          let currentState = new Float32Array(32).fill(0);

          function updateCanvas() {
            const width = canvas.width;
            const height = canvas.height;
            const cellSize = width / currentState.length;

            ctx.clearRect(0, 0, width, height);
            
            currentState.forEach((value, i) => {
              const x = i * cellSize;
              const y = height / 2;
              const magnitude = Math.abs(value) * 100;
              
              ctx.fillStyle = value >= 0 ? '#3b82f6' : '#ef4444';
              ctx.fillRect(x, y, cellSize - 1, value * 50);
            });
          }

          async function processInput() {
            const response = await fetch('/api/process', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ input: Math.random() * 2 - 1 })
            });
            
            const data = await response.json();
            currentState = new Float32Array(data.state);
            
            updateCanvas();
            stateDisplay.textContent = JSON.stringify(
              Array.from(currentState).map(x => x.toFixed(3)),
              null,
              2
            );
          }

          async function reset() {
            await fetch('/api/reset', { method: 'POST' });
            currentState = new Float32Array(32).fill(0);
            updateCanvas();
            stateDisplay.textContent = JSON.stringify(
              Array.from(currentState),
              null,
              2
            );
          }

          // Set up canvas
          function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            updateCanvas();
          }

          window.addEventListener('resize', resizeCanvas);
          resizeCanvas();
        </script>
      </body>
    </html>
  `;
}