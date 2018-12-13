class Hand:
    def __init__(self):
        self.card_list = []

    def add(self, card):
        self.card_list.append(card)

    def get(self, length):
        card = self.card_list[length]
        self.card_list.pop(length)
        return card

