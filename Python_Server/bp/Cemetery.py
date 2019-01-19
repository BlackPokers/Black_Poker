import Card


class Cemetery:
    def __init__(self):
        """
        墓地
        """
        self.card_list = []

    # 墓地にカードを追加する
    def add(self, card: Card):
        """
        カードを墓地に置く
        :param card: 墓地に置くカード
        """
        self.card_list.append(card)

    # 墓地のカードを取る
    def get(self, length: int) ->Card:
        """
        墓地のカードを選択する
        :param length: 何番目のカードか
        """
        return self.card_list.pop(length)
