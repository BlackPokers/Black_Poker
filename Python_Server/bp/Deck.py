import random
from .Card import Card
from typing import Union

class Deck:
    def __init__(self, card_list: list):
        """
        デッキ
        :param card_list: カードのリスト
        """
        self.card_list = card_list

    def first_step(self):
        """
        ターンの最初のドロー
        :return: ドローしたカード
        """
        return self.get_top()

    def get_top(self) ->Card:
        """
        デッキの一番上を取得
        :return: 取得したカード
        """
        return self.card_list.pop(len(self.card_list) - 1)

    def draw(self):
        """
        ドロー!
        :return: ドローしたカード
        """
        return self.get_top()

    def damage(self) ->Card:
        """
        ダメージを受けたときにデッキを減らす
        :return: デッキの一番上のカード
        """
        return self.get_top()

    def get(self, length: int) ->Card:
        """
        デッキからカードを一枚取得
        :param length: 何番目のカードか
        :return: 取得したカード
        """
        card = self.card_list[length]
        self.card_list.pop(length)
        return card

    def shuffle(self):
        """
        デッキのシャッフル
        """
        random.shuffle(self.card_list)

    # デッキからカードサーチ
    def search(self, number: int, mark: str) ->Union[Card, None]:
        """
        指定したカードのサーチ
        :param number: 指定するカードの数字
        :param mark: 指定するカードのマーク
        :return: 指定したカードが存在するならそのカードをなければNone
        """
        for i in range(0, len(self.card_list)):
            if self.card_list[i].number == number and self.card_list[i].mark == mark:
                return self.get(i)
        return None
