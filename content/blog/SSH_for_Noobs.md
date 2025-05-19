---
title : 'SSH for Noobs'
subtitle: "A beginner's guide to SSH"
date : '2025-05-19T21:51:21+05:30'
draft : true
tags : ['linux', 'ssh', 'security']
toc: true
next: true
image: ''
---

# SSH for Noobs
Many of you must have worked with AWS or GCP at some point, and even if you were scared of the terminals, you might have been forced to use it. And you also must have accessed the terminal of your service from your terminal. But wait? How is that possible, how can you access console of another system with your own? 

**The answer: SSH**

So what SSH actually is and how can you actually use it without copy pasting commands from the internet. Let's explore that in this blog post.

## What is SSH?
SSH stands for Secure Shell. It is a protocol that allows you to securely connect to a remote computer over a network. It provides a secure channel over an unsecured network by using encryption. SSH is widely used for remote administration of servers and secure file transfers.

SSH is a client-server protocol, which means that it consists of two parts: the SSH client and the SSH server. The SSH client is the program that you run on your local machine to connect to the remote server, while the SSH server is the program that runs on the remote machine and listens for incoming connections.

### A small history lesson
SSH was designed as a replacement for [Telnet](https://en.wikipedia.org/wiki/TELNET) and other insecure remote shell protocols. It was developed by Tatu Ylönen in 1995 and has since become the de facto standard for secure remote access to servers. By default, SSH uses port 22 for communication. This is actual email Tatu Ylönen sent to the [SSH mailing list](https://www.cs.hut.fi/ssh/) in 1995:

```
From ylo Mon Jul 10 11:45:48 +0300 1995 From: Tatu Ylonen <ylo@cs.hut.fi>
To: Internet Assigned Numbers Authority <iana@isi.edu>
Subject: request for port number
Organization: Helsinki University of Technology, Finland
Dear Sir, I have written a program to securely log from one machine into another over an
insecure network. It provides major improvements in security and functionality over existing
telnet and rlogin protocols and implementations. In particular, it prevents IP, DNS and
outing spoofing.  My plan is to distribute the software freely on the Internet and to get it
into as wide use as possible. I would like to get a registered privileged port number for
the software.

The number should preferably be in the range 1-255 so that it can be used in the WKS field
in name servers. I'll enclose the draft RFC for the protocol below. The software has been in
local use for several months, and is ready for publication except for the port number. If
the port number assignment can be arranged in time, I'd like to publish the software already
this week. I am currently using port number 22 in the beta test.

It would be great if this number could be used (it is currently shown as Unassigned in the
lists). The service name for the software is "ssh" (for Secure Shell).

Yours sincerely,  Tatu Ylonen <ylo@cs.hut.fi>  ... followed by protocol specification
for ssh-1.0
```
and the next morning, this is the reply he got:

```
Date: Mon, 10 Jul 1995 15:35:33 -0700 From: jkrey@ISI.EDU To: ylo@cs.hut.fi Subject: 
Re: request for port number  Cc: iana@ISI.EDU 
Tatu,  We have assigned port number 22 to ssh, with you as the point of contact.
Joyce
```
So that is how SSH was born and port 22 was assigned to it. 

Later in 2006 a revised verison of SSH called SSH2 was released which added more features and improved security. SSH2 is now the most widely used version of SSH and has been standardized by the Internet Engineering Task Force (IETF) in RFC 4251.

This new version of SSH added support for public key authentication, which allows users to authenticate without sending their passwords over the network. This is a more secure method of authentication, as it reduces the risk of password theft and brute-force attacks. SSH2 also introduced support for stronger encryption algorithms like [MD5](https://en.wikipedia.org/wiki/MD5) or [SHA-1](https://en.wikipedia.org/wiki/SHA-1), making it more difficult for attackers to intercept and decrypt the data being transmitted over the network.

## Where will it come handy?
SSH is a protocol that is cross platform and works on all UNIX like operating systems and even Windows now supports it natively. But before we get into the depths of SSH, let's take a look at some common use cases where SSH can be useful:
- **Remote server administration**: SSH allows you to securely connect to a remote server and perform administrative tasks, such as installing software, managing files, and configuring services.
- **Secure file transfers**: SSH can be used to securely transfer files between your local machine and a remote server using tools like `scp` (secure copy) and `sftp` (SSH File Transfer Protocol).
- **Tunneling**: SSH can be used to create secure tunnels for other protocols, allowing you to securely access services on a remote server that may not be directly accessible over the internet.
- **Port forwarding**: SSH can be used to forward network traffic from one port on your local machine to another port on a remote server, allowing you to securely access services that are not directly accessible over the internet.
- **Remote desktop access**: SSH can be used to securely access the graphical user interface (GUI) of a remote server using tools like `X11 forwarding` or `VNC over SSH`.
- **Git over SSH**: SSH is commonly used for secure access to Git repositories, allowing you to clone, push, and pull changes securely.
- **Secure backups**: SSH can be used to securely back up files and directories from your local machine to a remote server using tools like `rsync` or `tar` over SSH.
- **Secure access to IoT devices**: SSH can be used to securely access and manage Internet of Things (IoT) devices, such as Raspberry Pi or Arduino boards, over the internet.
- **Secure access to cloud services**: SSH is commonly used to securely access cloud services, such as AWS, GCP, or Azure, allowing you to manage your cloud resources securely.
- **Secure access to network devices**: SSH can be used to securely access and manage network devices, such as routers, switches, and firewalls, over the internet.

## How does SSH work?
If you hated Computer Networks classes, well too bad, it is here again. But don't worry, I will try to keep it as simple as possible.
SSH uses a client-server architecture, where the SSH client initiates a connection to the SSH server. The SSH server listens for incoming connections on a specific port (usually port 22) and authenticates the client before allowing access. It uses TCP/IP protocol suite for communication, which is a standard protocol for transmitting data over the internet. It looks like this:

![SSH Architecture](/blog-assets/ssh_layer.svg)

Let's break down the layers of SSH:
- **TCP/IP**: The underlying protocol used for communication between the client and server. It provides reliable, ordered, and error-checked delivery of data packets.
- **SSH Transport Layer**: This layer is responsible for establishing a secure connection between the client and server. It handles key exchange, encryption, and integrity checking. The transport layer uses symmetric encryption algorithms (e.g., AES, Blowfish) to encrypt the data being transmitted.
- **SSH Authentication Layer**: This layer is responsible for authenticating the client and server. It supports various authentication methods, including password-based authentication, public key authentication, and keyboard-interactive authentication. The authentication layer uses asymmetric encryption algorithms (e.g., RSA, DSA, ECDSA) to securely exchange keys and verify identities.
- **SSH Connection Layer**: This layer is responsible for managing multiple channels of communication between the client and server. It allows for the multiplexing of multiple sessions over a single SSH connection, enabling features like port forwarding and X11 session forwarding.

### Let's explore it step by step

1. **Connection Initialization**: When you type the command `ssh user@hostname`, the SSH client initiates a connection to the SSH server running on the remote machine. This happens over port 22 by default. If the connection is successful, a three-way handshake is established between the client and server using the TCP protocol. This handshake ensures that both parties are ready to communicate and agree on the parameters of the connection.

2. **Settling verions parities**: After the TCP handshake, the SSH client and server exchange version information to determine which version of the SSH protocol they will use for communication. This is important because different versions of SSH may have different features and security capabilities. Example: `SSH-2.0-OpenSSH_7.9p1 Debian-10+deb10u2`,

3. **Key Exchange**: The SSH client and server perform a key exchange to establish a shared secret key for encrypting the data transmitted over the connection. This process involves the following steps:
   - The client and server agree on a set of encryption algorithms and hashing functions to use for the session.
   - They generate a unique session key using a key exchange algorithm (e.g., Diffie-Hellman or Elliptic Curve Diffie-Hellman).
   - The session key is used to encrypt the data transmitted between the client and server.

4. **Encrytion and MAC Setups**: Both sides agree on the encryption and MAC (Message Authentication Code) algorithms to use for the session. The MAC is used to ensure the integrity of the data being transmitted, preventing tampering or modification during transit. The client and server exchange messages to confirm the selected algorithms. 
   - Example: `KEX algorithms: curve25519-sha256`

5. **Authentication Phase**: This is the most important phase of the SSH connection process. The SSH server authenticates the client using one of several authentication methods, including:
   - **Password Authentication**: The client sends its username and password to the server for verification. This method is simple but less secure than other methods.The server checks the password against its internal user database (e.g., `/etc/shadow` on Linux). If it matches, authentication succeeds.
     - Pros: Easy to set up and use.
     - Cons: Vulnerable to brute-force attacks and password theft and requires the user to enter a password each time they connect.

   - **Public Key Authentication**: The client uses a public-private key pair to authenticate itself to the server. The server checks if the client's public key is authorized for access. This method is more secure and is recommended for most use cases.The user has a private key on their local machine (e.g., ~/.ssh/id_rsa). The client generates a key pair (public and private keys) using a key generation algorithm (e.g., RSA, DSA, ECDSA). The public key is stored on the server in the `~/.ssh/authorized_keys` file. When the client connects, it sends a request to authenticate using its public key. The server generates a random challenge and encrypts it with the client's public key. The client decrypts the challenge using its private key and sends it back to the server. If the decrypted challenge matches the original challenge, authentication succeeds.
     - Pros: More secure than password authentication and does not require entering a password each time.
     - Cons: Requires initial setup of public-private key pairs.
    
SSH is "secure" because it incorporates encryption and authentication via a process called public key cryptography. Public key cryptography is a way to encrypt data, or sign data, with two different keys. One of the keys, the public key, is available for anyone to use. The other key, the private key, is kept secret by its owner. Because the two keys correspond to each other, establishing the key owner's identity requires possession of the private key that goes with the public key.

These "asymmetric" keys — so called because they have different values — also make it possible for the two sides of the connection to negotiate identical, shared symmetric keys for further encryption over the channel. Once this negotiation is complete, the two sides use the symmetric keys to encrypt the data they exchange.

In an SSH connection, both sides have a public/private key pair, and each side authenticates the other using these keys. This differentiates SSH from HTTPS, which in most implementations only verifies the identity of the web server in a client-server connection. (Other differences include that HTTPS usually does not allow the client to access the server's command line, and that firewalls sometimes block SSH but almost never block HTTPS.)

6. **Connection Established**: Once the client is authenticated, the SSH server creates a secure channel for communication. The client and server can now exchange data securely over the established connection. The SSH connection can be used for various purposes, such as remote command execution, file transfers, or tunneling other protocols. If connected via the terminal, you will see a shell prompt on the remote server, allowing you to execute commands as if you were physically present at the server.

## How to use SSH?
Now that we have a basic understanding of SSH, let's explore how to use it in practice. We'll cover the following topics:
- **Installing SSH**: How to install the SSH client and server on different operating systems.
- **Connecting to a remote server**: How to establish an SSH connection to a remote server.
- **SSH key generation**: How to generate SSH key pairs for secure authentication.
- **SSH configuration**: How to configure SSH settings for better security and usability.

### Installing SSH
#### UNIX/Linux
Most Linux distributions come with SSH pre-installed. You can check if SSH is installed by running the following command in your terminal:
```bash
ssh -V
```
If SSH is not installed, you can install it using your package manager. For example, on Ubuntu or Debian-based systems, you can use the following command:
```bash
sudo apt-get install openssh-client openssh-server
```
On MacOS, SSH is pre-installed, and you can use it directly from the Terminal app.

#### Windows
On Windows, you can use the built-in OpenSSH client or install a third-party SSH client like PuTTY. To check if OpenSSH is installed, open PowerShell and run:
```powershell
ssh -V
```
If OpenSSH is not installed, you can enable it in Windows Settings:
1. Go to Settings > Apps > Optional features.
2. Click on "Add a feature."
3. Search for "OpenSSH Client" and click "Install."
Alternatively, you can download and install PuTTY from the official website: [PuTTY Download Page](https://www.putty.org/).

### Connecting to a remote server
To connect to a remote server using SSH, use the following command:
```bash
ssh username@hostname
```
Replace `username` with your username on the remote server and `hostname` with the server's IP address or domain name. For example:
```bash
ssh defaultuser@192.168.1.36
```

If this is your first time connecting to the server, you will see a message asking if you want to continue connecting. Type `yes` and press Enter. You will then be prompted to enter your password for the remote server. After entering your password, you will be logged into the remote server's shell. This will save the server's fingerprint in your `~/.ssh/known_hosts` file, so you won't be prompted again for this server unless the fingerprint changes.

In some cases, to log in to a remote server, you may have a `.pem` file or a private key file. In that case, you can use the `-i` option to specify the path to your private key file:
```bash
ssh -i /path/to/private_key.pem username@hostname
```
   
### SSH Key Generation
1. To use public key authentication, you need to generate an SSH key pair (public and private keys). You can do this using the `ssh-keygen` command. Open your client's terminal and run the following command:
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```
- `-t rsa`: Specifies the type of key to create (RSA in this case).
- `-b 4096`: Specifies the number of bits in the key (4096 bits is recommended for security).
- `-C`: Adds a comment to the key (usually your email address).

2. After running the command, you will see a similar prompt:
```bash
Enter file in which to save the key (/home/yourname/.ssh/id_rsa):
```
Press Enter to accept the default location or specify a different path. You will then be prompted to enter a passphrase for added security. You can leave it empty, but it's recommended to use a passphrase.

3. After generating the key pair, you will see two files:
```bash
ls ~/.ssh
```
- `id_rsa`: Your private key (keep this secure and never share it).
- `id_rsa.pub`: Your public key (this can be shared with others).

4. To use public key authentication, you need to copy your public key to the remote server. You can do this using the `ssh-copy-id` command:
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub user@server_ip
```
Replace `user` with your username on the remote server and `server_ip` with the server's IP address. This command will prompt you for your password on the remote server and copy your public key to the `~/.ssh/authorized_keys` file on the server.
This allows you to log in without entering a password in the future.

5. Now you can log in to the remote server using your private key:
```bash
ssh user@server_ip
```
You should be logged in without being prompted for a password.

### SSH Configuration
SSH configuration files allow you to customize the behavior of the SSH client and server. The main configuration files are:
- **Client Configuration**: The SSH client configuration file is located at `~/.ssh/config`. You can use this file to set default options for your SSH connections, such as the default username, port, and identity file. Here's an example of a client configuration file:
```bash
Host myserver
    HostName example.com
    User myusername
    Port 2222
    IdentityFile ~/.ssh/my_private_key
```

To test your configuration, you can use the following command:
```bash
ssh -v myserver
```
Verbose mode will show you the details of the connection process, including the configuration options being used.

## SSH Usage Examples
Now let's look how you can use SSH to manage your remote servers and perform various tasks.

Here's a list of **commonly used SSH commands** with explanations — these cover remote access, file transfer, tunneling, and key management.

---

## 1. Basic SSH Login

```bash
ssh user@host
```

* Connects to a remote server via SSH.
* Example:

  ```bash
  ssh ubuntu@192.168.1.10
  ```

## 2. Specify Private Key

```bash
ssh -i ~/.ssh/id_rsa user@host
```

* Used when the key isn’t the default `~/.ssh/id_rsa`.

## 3. Sync Files with `rsync` Over SSH
rsync is a tool used to efficiently copy and synchronize files or directories between two locations. It only transfers the parts of files that have changed, which saves time and bandwidth. It can be used locally or over SSH for remote transfers.

Example: If you have a folder of project files on your computer and want to back it up to a server, you can run:
```bash
rsync -avz ~/Projects/ user@server:/backups/Projects/
```
This command syncs your local Projects folder to the remote server, updating only the changes. `rsync` is more efficient than `scp` for repeated transfers.


## 4. Transfer Files with `scp` (Secure Copy)
scp stands for "secure copy" and is used to copy files or directories between two systems over SSH. Unlike `rsync`, it transfers entire files each time, even if only part of the file changed.

Example: To copy a configuration file to a remote server, you can run:
```bash
scp nginx.conf user@192.168.1.100:/etc/nginx/nginx.conf
```

To copy a file from a remote server.

Copy directories:

```bash
scp -r my_folder user@host:/path
```
## 5. Port Forwarding (Tunneling)
Port forwarding is like forwarding a message between two people. Bob may send a message to Alice, who in turn passes it to Dave. Similarly, port forwarding sends data packets directed at an IP address and port on one machine to an IP address and port on a different machine.

For example, imagine an administrator wants to make a change on a server inside a private network they manage, and they want to do so from a remote location. However, for security reasons, that server only receives data packets from other computers within the private network. The administrator could instead connect to a second server within the network — one that is open to receiving Internet traffic — and then use SSH port forwarding to connect to the first server. From the first server's perspective, the administrator's data packets are coming from inside the private network.

### Local Port Forwarding

```bash
ssh -L 8080:localhost:80 user@host
```

* Forwards your `localhost:8080` to the remote server’s `localhost:80`.

### Remote Port Forwarding

```bash
ssh -R 9090:localhost:3000 user@host
```

* Allows remote machine to access your `localhost:3000` via `remote:9090`.

## 6. Execute a Remote Command
To runs a command on the remote server without starting an interactive session.

```bash
ssh user@host "uptime"
```

## 7. Logout or Exit SSH Session
When you are done with your SSH session, you can log out by typing:

```bash
exit
```
or press `Ctrl + D`

