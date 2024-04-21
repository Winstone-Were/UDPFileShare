import { View, Text } from 'react-native'
import React, { useEffect, useState } from 'react';
import {Button, TextInput } from 'react-native';

import UdpSocket from 'react-native-udp';
import { NetworkInfo } from 'react-native-network-info';

export default function App() {

  const [ipAddress, setIpAddress] = useState('');
  const [isServer, setIsServer] = useState(false);
  const [message, setMessage] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [socket, setSocket] = useState();
  const [ipServer, setIpServer] = useState('IP Server');

  useEffect(() => {
    const fetchIpAddress = async () => {
      const ip = await NetworkInfo.getIPV4Address();
      setIpAddress(ip);
    }

    fetchIpAddress();

    if (isServer) {
      setConnectionStatus('Server Disconnect');
      const server = UdpSocket.createSocket('udp4');

      server.on('message', (data, rinfo) => {
        setMessage(data.toString());
        console.log('Received message: ', data.toString());
      });

      server.on('listening', () => {
        console.log('Sever listening on port : ', server.address().port);
        setConnectionStatus('Server listening on port : ', server.address().port);
      });

      server.bind(8080);

      setSocket(server);

    } else {
      const client = UdpSocket.createSocket('udp4');
      client.bind(8079);
      setSocket(client);
    }

    return () => {
      socket && socket.close();
    }

  }, [isServer]);

  const sendMessage = () => {
    if (isServer) return;
    const client = socket;

    client.send('hello from client', undefined, undefined, 8080, ipServer, (error) => {
      if (error) {
        console.error(error);
      } else {
        console.log('succesful communication');
      }
    });

    client.on('message', async (message, remoteInfo) => {
      setMessage(message.toString());
    });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{connectionStatus}</Text>
      <Button
        title={isServer ? 'Server' : 'Client'}
        onPress={() => setIsServer(!isServer)}
      />
      <Button title="Send Message" onPress={sendMessage} disabled={isServer} />
      <TextInput
        onChangeText={setIpServer}
        value={ipServer}
      />
      <Text>IP : {ipAddress}</Text>
      <Text>Message Received : {message}</Text>
    </View>
  )
}