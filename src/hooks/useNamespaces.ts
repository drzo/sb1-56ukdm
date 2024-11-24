import { useQuery } from '@tanstack/react-query';
import type { Namespace } from '../types/namespaces';

export function useNamespaces() {
  return useQuery<Namespace[]>({
    queryKey: ['namespaces'],
    queryFn: async () => [{
      id: 'root',
      type: 'directory',
      name: '/',
      path: '/',
      children: [
        {
          id: 'usr',
          type: 'directory',
          name: 'usr',
          path: '/usr',
          children: [
            {
              id: 'usr-bin',
              type: 'directory',
              name: 'bin',
              path: '/usr/bin'
            }
          ]
        },
        {
          id: 'bin',
          type: 'directory',
          name: 'bin',
          path: '/bin',
          mountPoint: '/usr/bin'
        },
        {
          id: 'dev',
          type: 'directory',
          name: 'dev',
          path: '/dev',
          children: [
            {
              id: 'cons',
              type: 'file',
              name: 'cons',
              path: '/dev/cons'
            },
            {
              id: 'null',
              type: 'file',
              name: 'null',
              path: '/dev/null'
            },
            {
              id: 'wsys',
              type: 'directory',
              name: 'wsys',
              path: '/dev/wsys'
            }
          ]
        },
        {
          id: 'net',
          type: 'directory',
          name: 'net',
          path: '/net',
          children: [
            {
              id: 'tcp',
              type: 'directory',
              name: 'tcp',
              path: '/net/tcp'
            },
            {
              id: 'udp',
              type: 'directory',
              name: 'udp',
              path: '/net/udp'
            }
          ]
        },
        {
          id: 'proc',
          type: 'directory',
          name: 'proc',
          path: '/proc',
          children: [
            {
              id: 'proc-1',
              type: 'directory',
              name: '1',
              path: '/proc/1'
            },
            {
              id: 'self',
              type: 'mount',
              name: 'self',
              path: '/proc/self',
              mountPoint: '/proc/1'
            }
          ]
        },
        {
          id: 'srv',
          type: 'directory',
          name: 'srv',
          path: '/srv',
          children: [
            {
              id: 'boot',
              type: 'file',
              name: 'boot',
              path: '/srv/boot'
            },
            {
              id: 'dns',
              type: 'file',
              name: 'dns',
              path: '/srv/dns'
            }
          ]
        },
        {
          id: 'mnt',
          type: 'directory',
          name: 'mnt',
          path: '/mnt',
          children: [
            {
              id: 'wsys',
              type: 'mount',
              name: 'wsys',
              path: '/mnt/wsys',
              mountPoint: '/dev/wsys'
            }
          ]
        }
      ]
    }]
  });
}