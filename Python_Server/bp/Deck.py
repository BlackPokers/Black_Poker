import random
from .Card import Card
from typing import Union

class Deck:
    def __init__(self, card_list: list):
        self.card_list = card_list

    # ターンの最初のドロー
    def first_step(self):
        return self.get_top()

    # デッキの一番上を取る
    def get_top(self) ->Card:
        return self.card_list.pop(len(self.card_list) - 1)

    # ドロー
    def draw(self):
        return self.get_top()

    # ダメージを受けたときデッキを減らす
    def damage(self) ->Card:
        return self.get_top()

    # デッキの任意の場所から取る
    def get(self, length: int) ->Card:
        card = self.card_list[length]
        self.card_list.pop(length)
        return card

    # デッキのシャッフル
    def shuffle(self):
        random.shuffle(self.card_list)

    # デッキからカードサーチ
    def search(self, number: int, mark: str) ->Union[Card, None]:
        for i in range(0, len(self.card_list)):
            if self.card_list[i].number == number and self.card_list[i].mark == mark:
                return self.get(i)
        return None
