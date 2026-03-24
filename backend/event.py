# python_core/event.py

class Event:
    """
    事件类，代表马尔可夫链中的一个状态（圆圈）
    """
    def __init__(self, event_id: str, name: str):
        """
        初始化事件
        :param event_id: 事件的唯一标识符
        :param name: 事件显示的名称
        """
        self.id = event_id
        self.name = name

    def rename(self, new_name: str) -> None:
        """
        更改事件名称
        :param new_name: 新的名称
        """
        self.name = new_name

    def __repr__(self):
        return f"<Event id={self.id} name={self.name}>"
