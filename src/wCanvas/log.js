class wcLogger {
    constructor() {
        this.threadWidth = 7;
    }

    formatThread(thread) {
        return thread.toUpperCase().padEnd(this.threadWidth, ' ');
    }

    info(msg, thread = "main", show = true) {
        let date = new Date();
        if(show) {
            console.log(
                `[${date.toLocaleString()}] [THREAD/${this.formatThread(thread)}] [wCanvas/INFO ] ${msg}`
            );
        }
    }

    warn(msg, thread = "main") {
        let date = new Date();
        console.log(
            `[${date.toLocaleString()}] [THREAD/${this.formatThread(thread)}] [wCanvas/WARN ] ${msg}`
        );
    }

    err(msg, thread = "main") {
        let date = new Date();
        console.log(
            `[${date.toLocaleString()}] [THREAD/${this.formatThread(thread)}] [wCanvas/ERROR] ${msg}`
        );
    }
}

export default new wcLogger();
