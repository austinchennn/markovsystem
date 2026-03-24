# python_core/markov_system.py

from typing import List, Dict, Tuple, Optional
import numpy as np
from event import Event
from transition import Transition

class MarkovSystem:
    """
    马尔可夫链系统控制器
    该类负责整个系统的管理，包括事件的添加、移除，转移的建立和维护。
    """
    def __init__(self):
        """
        初始化系统
        """
        self.events: Dict[str, Event] = {}
        self.transitions: Dict[str, Transition] = {}

    def add_event(self, event_id: str, name: str) -> None:
        """
        添加一个新事件（状态）到系统
        :param event_id: 事件ID
        :param name: 事件名称
        """
        if event_id in self.events:
            raise ValueError(f"Event with id {event_id} already exists.")
        
        self.events[event_id] = Event(event_id, name)

    def remove_event(self, event_id: str) -> None:
        """
        删除一个事件，并移除所有与之相关的转移
        :param event_id: 事件ID
        """
        if event_id not in self.events:
            return
        del self.events[event_id]

        # 找到所有相关的转移ID
        to_remove = []
        for tid, t in self.transitions.items():
            if t.from_id == event_id or t.to_id == event_id:
                to_remove.append(tid)

        # 移除相关的转移
        for tid in to_remove:
            del self.transitions[tid]

    def add_transition(self, transition_id: str, from_id: str, to_id: str, probability: float) -> None:
        """
        添加一个转移（箭头）
        :param transition_id: 转移ID
        :param from_id: 起始事件ID
        :param to_id: 目标事件ID
        :param probability: 转移概率
        """
        if from_id not in self.events or to_id not in self.events:
            raise ValueError("Both from_id and to_id must exist in the system.")
        
        # 创建新的转移对象
        new_transition = Transition(transition_id, from_id, to_id, probability)
        self.transitions[transition_id] = new_transition

    def update_probability(self, transition_id: str, new_prob: float) -> None:
        """
        更新特定转移的概率
        :param transition_id: 转移ID
        :param new_prob: 新概率
        """
        if transition_id in self.transitions:
            self.transitions[transition_id].update_probability(new_prob)
    
    def validate(self) -> List[str]:
        """
        验证系统的完整性
        规则：每个事件发出的所有转移概率之和必须等于 1
        :return: 错误信息列表
        """
        errors = []
        
        for event_id, event in self.events.items():
            outgoing = [t for t in self.transitions.values() if t.from_id == event_id]
            total_prob = sum(t.probability for t in outgoing)
            
            # 浮点数比较，使用一个很小的 epsilon
            epsilon = 1e-4
            if abs(total_prob - 1.0) > epsilon:
                errors.append(
                    f"Event '{event.name}' outgoing probability sum is {total_prob:.3f}, expected 1.0."
                )
        
        return errors

    def get_transition_matrix(self) -> Tuple[List[str], np.ndarray]:
        """
        获取系统的状态转移矩阵
        :return: (事件ID列表, 转移矩阵)
                 矩阵 matrix[i][j] 表示从状态 i 转移到状态 j 的概率
        """
        event_ids = list(self.events.keys())
        n = len(event_ids)
        
        if n == 0:
            return [], np.array([])

        matrix = np.zeros((n, n))
        
        for t in self.transitions.values():
            try:
                i = event_ids.index(t.from_id)
                j = event_ids.index(t.to_id)
                matrix[i, j] += t.probability
            except ValueError:
                # 如果某个ID在事件列表里找不到（应该被 remove_event 处理掉，但为了健壮性）
                pass
                
        return event_ids, matrix

    def simulate(self, steps: int, initial_state: Optional[List[float]] = None) -> Tuple[List[int], List[List[float]]]:
        """
        模拟系统从初始状态随时间的演变（矩阵乘法）
        :param steps: 模拟的步数
        :param initial_state: 初始概率分布向量（可选）
        :return: (步数列表, 每一行是对应步数的概率分布向量)
        """
        ids, matrix = self.get_transition_matrix()
        n = len(ids)
        
        if n == 0:
            return [], []

        # 初始状态向量
        if initial_state and len(initial_state) == n:
            current_state = np.array(initial_state)
        else:
            # 默认为均匀分布
            current_state = np.ones(n) / n
        
        result_steps = [0]
        result_distributions = [current_state.tolist()]
        
        # 迭代乘法
        # state(t+1) = state(t) * P
        # 这里的 state 是行向量，P 是转移矩阵 (行和=1)
        for step in range(1, steps + 1):
            current_state = np.dot(current_state, matrix)
            result_steps.append(step)
            result_distributions.append(current_state.tolist())

        return result_steps, result_distributions
