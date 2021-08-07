development = 'ws://localhost:4000'
production = 'wss://sipejam-restfullapi.herokuapp.com'

# long live
import websocket
try:
    import thread
except ImportError:
    import _thread as thread
import time
import json

def on_message(ws, message):
  print(message)
  messageDict = json.loads(message)
  value = messageDict['data']['value']
  meta = messageDict['data']['meta']

  print(value, meta)
  if(value ==  'success' and meta ==  'join'):
    print('masuk pak eko')
    for i in range(6):
      ws.send(json.dumps({ "event": "vehicle_1", "data": {"iot_token": "057110891c54543e9b645c8aaa65d25ea6c27f5d8e620fafb98e5aff9fbbf7f3", "vehicle": i} }))
      time.sleep(2)

  if (meta ==  'power'):
    # doing your job here for turn off/on microcontroller. 
    # result if print(message) e.g {'event': 'from_web', 'data': {'meta':'power', 'value': 'on'}}
    print('power', value)

  if (meta == 'lamp'):
     # doing your job here for turn off/on microcontroller. 
    # result if print(message) e.g {'event': 'from_web', 'data': {'meta':'power', 'value': 'on'}}
    print('lamp', value)


def on_error(ws, error):
    print(error)

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")

def on_open(ws):
    ws.send(json.dumps({ "event": "system", "data": {"iot_token": "057110891c54543e9b645c8aaa65d25ea6c27f5d8e620fafb98e5aff9fbbf7f3", "meta": "join"} }))


ws = websocket.WebSocketApp(production,
                        on_open=on_open,
                        on_message=on_message,
                        on_error=on_error,
                        on_close=on_close)


ws.run_forever()




