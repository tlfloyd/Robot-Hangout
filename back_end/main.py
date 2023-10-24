from typing import Mapping, Any, List, Dict, Tuple
import os
from http_daemon import delay_open_url, serve_pages

lastUpdate:int = 0

class Player():
    def __init__(self, id:str) -> None:
        self.id = id
        self.x = 0
        self.y = 0
        self.what_i_know:int = 0

players: Dict[str, Player] = {}
history: List[Player] = []

def find_player(id:str) -> None:
    if (id in players):
        return players[id]
    else:
        players[id] = Player(id)
        return players[id]

def update(payload: Mapping[str, Any]) -> Mapping[str, Any]:
    action = payload["action"]
    if action == 'click':
        player = find_player(payload["id"])
        player.x = payload["x"]
        player.y = payload["y"]
        history.append(player)
        return {
            'message': 'click recorded'
        }
    elif action == 'getUpdates':
        player = find_player(payload["id"])
        remaining_history = history[player.what_i_know:]
        player.what_i_know = len(history)
        updates: List[Tuple[str, int, int]] = {}
        for i in range(len(remaining_history)):
            playerUpdate = remaining_history[i]
            updates[len(updates)] = (playerUpdate.id, playerUpdate.x, playerUpdate.y)
        return {
            "updates": updates
        }

    print(f'make_ajax_page was called with {payload}')


def main() -> None:
    # Get set up
    os.chdir(os.path.join(os.path.dirname(__file__), '../front_end'))

    # Serve pages
    port = 8987
    delay_open_url(f'http://127.0.0.1:{port}/game.html', .1)
    serve_pages(port, {
        'ajax.html': update,
    })
    lastUpdate = len(history)

if __name__ == "__main__":
    main()
