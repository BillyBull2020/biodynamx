class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        // Simple passthrough buffer — runs at whatever rate the AudioContext uses.
        // The mic AudioContext is created at 16kHz so this outputs 16kHz directly.
        // No downsampling needed.
        this.bufferSize = 2048;
        this.buffer = new Float32Array(this.bufferSize);
        this.bytesWritten = 0;
    }

    process(inputs) {
        const input = inputs[0];
        if (input && input.length > 0 && input[0]) {
            const channelData = input[0];
            for (let i = 0; i < channelData.length; i++) {
                this.buffer[this.bytesWritten++] = channelData[i];
                if (this.bytesWritten >= this.bufferSize) {
                    this.port.postMessage(this.buffer);
                    this.bytesWritten = 0;
                    this.buffer = new Float32Array(this.bufferSize);
                }
            }
        }
        return true;
    }
}

registerProcessor('audio-processor', AudioProcessor);
