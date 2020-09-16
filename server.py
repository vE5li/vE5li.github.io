#!/usr/bin/env python

import asyncio
import websockets

async_state = type('', (), {})()
async_state.sockets = []
async_state.light_state = True
async_state.lamp_state = True
async_state.portal_state = True
async_state.television_state = True
async_state.shelf_state = True
async_state.desk_state = True

def state_from_character(character):
    return character == '1'

def character_from_state(state):
    return '1' if state else '0'

async def update_switch_states(state, character):
    message = character + character_from_state(state)
    for socket in async_state.sockets:
        await socket.send(message)

async def echo(websocket, path):
    async_state.sockets.append(websocket)
    websocket.connection_lost_waiter.add_done_callback(lambda future: async_state.sockets.remove(websocket))

    async for message in websocket:
        target = message[0]

        if target == '0':
            message = target + character_from_state(async_state.light_state) + character_from_state(async_state.lamp_state) + character_from_state(async_state.portal_state) + character_from_state(async_state.television_state) + character_from_state(async_state.shelf_state) + character_from_state(async_state.desk_state)
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

        else:
            print("invalid target " + target)
            await websocket.send("XX")

start_server = websockets.serve(echo, port=8765)
print("server started")

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
