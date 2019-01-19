import tornado.ioloop
import tornado.web
import tornado.websocket

cl = []
num = None

class wrapInt:
    def __init__(self, n: int):
        self.a = n

    def inc(self):
        self.a += 1;

    def get(self):
        return self.a

class WebSocketHandler(tornado.websocket.WebSocketHandler):

    def check_origin(self, origin):
        return True

    def open(self):
        if self not in cl:
            cl.append(self)
            num.inc()
        print(str(num.get()))
        self.write_message(str(num.get()))

    @staticmethod
    def on_message(message):
        for client in cl:
            client.write_message(message)

    def on_close(self):
        if self in cl:
            cl.remove(self)


class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('test_ws.html')


application = tornado.web.Application([
    (r"/", MainHandler),
    (r"/websocket", WebSocketHandler),
])

if __name__ == "__main__":
    if num is None:
        num = wrapInt(0)
    application.listen(8080)
    tornado.ioloop.IOLoop.current().start()
