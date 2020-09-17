#!/usr/bin/env python

import asyncio
import websockets

async_state = type('', (), {})()
async_state.clients = []
async_state.light_state = True
async_state.lamp_state = True
async_state.portal_state = True
async_state.television_state = True
async_state.shelf_state = True
async_state.desk_state = True
async_state.shelf_color = "ff0000"
async_state.desk_color = "ff0000"

def state_from_character(character):
    return character == '1'

def character_from_state(state):
    return '1' if state else '0'

async def update_switch_states(state, character):
    message = character + character_from_state(state)
    for client in async_state.clients:
        await client.send(message)

async def update_indicator_color(color, character):
    message = character + color
    for client in async_state.clients:
        await client.send(message)

async def register_client(client):
    async_state.clients.append(client)
    print("client connected")
    print("client count " + str(len(async_state.clients)))

async def unregister_client(socket):
    async_state.clients.remove(socket)
    print("client disconnected")
    print("client count " + str(len(async_state.clients)))

async def echo(websocket, path):
    await register_client(websocket)

    try:
        while True:
            message = await websocket.recv()
            target = message[0]

            if target == '0':
                message = target + character_from_state(async_state.light_state) + character_from_state(async_state.lamp_state) + character_from_state(async_state.portal_state) + character_from_state(async_state.television_state) + character_from_state(async_state.shelf_state) + character_from_state(async_state.desk_state) + async_state.shelf_color + async_state.desk_color
                await websocket.send(message)

            elif target == 'm':
                message = message[1:]
                print("message for you: " + message)

            elif target == 'L':
                state = state_from_character(message[1])
                async_state.light_state = state
                await update_switch_states(state, target)

            elif target == 'l':
                state = state_from_character(message[1])
                async_state.lamp_state = state
                await update_switch_states(state, target)

            elif target == 'p':
                state = state_from_character(message[1])
                async_state.portal_state = state
                await update_switch_states(state, target)

            elif target == 't':
                state = state_from_character(message[1])
                async_state.television_state = state
                await update_switch_states(state, target)

            elif target == 's':
                state = state_from_character(message[1])
                async_state.shelf_state = state
                await update_switch_states(state, target)

            elif target == 'd':
                state = state_from_character(message[1])
                async_state.desk_state = state
                await update_switch_states(state, target)

            elif target == 'S':
                color = message[1:]
                async_state.shelf_color = color
                await update_indicator_color(color, target)

            elif target == 'D':
                color = message[1:]
                async_state.desk_color = color
                await update_indicator_color(color, target)

            else:
                print("invalid target " + target)
                await websocket.send("XX")

    except websockets.ConnectionClosedOK:
        await unregister_client(websocket)

    except websockets.ConnectionClosedError:
        await unregister_client(websocket)

    except RuntimeError:
        print("runtime error")
        await unregister_client(websocket)

start_server = websockets.serve(echo, port=8765)
print("server started")

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
