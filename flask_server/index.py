#!/usr/bin/env python
from flask_server.common import *

@app.route("/")
@app.route("/index")
def main():
    return render_template('index.html')


if __name__ == "__main__":
    urls_for()
    app.run()
