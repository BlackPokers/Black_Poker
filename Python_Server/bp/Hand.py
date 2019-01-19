import Card


class Hand:
    def __init__(self):
        self.card_list = []

    # 手札にカードを追加
    def add(self, card: Card):
        self.card_list.append(card)

    # 手札からカードを取り出す
    def get(self, length: int) ->Card:
        card = self.card_list[length]
        self.card_list.pop(length)
        return card

