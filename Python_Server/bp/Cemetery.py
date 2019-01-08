from .Card import Card

class Cemetery:
    def __init__(self):
        self.card_list = []

    # 墓地にカードを追加する
    def add(self, card: Card):
        self.card_list.append(card)

    # 墓地のカードを取る
    def get(self, length: int) ->Card:
        return self.card_list.pop(length)


