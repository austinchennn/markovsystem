# python_core/transition.py

class Transition:
    """
    转移类，代表两个事件之间的有向连接（箭头）
    """
    def __init__(self, transition_id: str, from_id: str, to_id: str, probability: float):
        """
        初始化转移
        :param transition_id: 转移的唯一标识符
        :param from_id: 起始事件的ID (Tail of the arrow in description... wait, from_id is usually tail, to_id is head)
        :param to_id: 目标事件的ID (Head of the arrow)
        :param probability: 转移的概率
        """
        self.id = transition_id
        self.from_id = from_id
        self.to_id = to_id
        
        # 确保概率在 [0, 1] 范围内
        self.probability = max(0.0, min(1.0, probability))

    def update_probability(self, new_prob: float) -> None:
        """
        更新转移的概率
        :param new_prob: 新的概率值 (0.0 - 1.0)
        """
        self.probability = max(0.0, min(1.0, new_prob))

    def __repr__(self):
        return f"<Transition id={self.id} from={self.from_id} to={self.to_id} prob={self.probability:.2f}>"
