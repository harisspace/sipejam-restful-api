# **SIPEJAM RESTful API**
The official  SIPEJAM RESTful API

## **Structure**
| Codebase | Description |
| -------- | ----------- |
| sipejam-restful-api | [restful api](https://github.com/harisspace/sipejam-restful-api) |
| sipejam-client | [nextjs client side](https://github.com/harisspace/sipejam-client) |

---

[DOCUMENTATION](#documentation)

## Documentation

### List of Events

- speed_1
- speed_2
- vehicle_1
- vehicle_2
- small_vehicle_1
- small_vehicle_2

## Format Websocket Event

### **Speed Event**

```
{
  "event": "speed_1", // for speed_1 event
  "data": {
    "iot_token": "yourIoTtoken",
    "speed": dinamic data here
  }
}
```

### **Vehicle Event**
#### ***Notes***
*Vehicle event is for big vehicle (truck or bus)*

```
{
  "event": "vehicle_1", // for vehicle_1 event
  "data": {
    "iot_token": "yourIoTtoken",
    "vehicle": dinamic data here
  }
}
```

### **Small Vehicle Event**

```
{
  "event": "small_vehicle_1", // for small_vehicle_1 event
  "data": {
    "iot_token": "yourIoTtoken",
    "small_vehicle": dinamic data here
  }
}
```
