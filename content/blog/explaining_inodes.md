---
title: 'Explaining Inodes In Linux'
subtitle: 'Understanding how the files are structured and their permission in linux.'
date : '2025-01-27T23:05:52+05:30'
tags : ['Linux', 'Filesystem']
draft : false
toc: true
---

## What are Inodes?
If you are a linux user, you must have encountered some kind `Insufficient Permission` or `File not found` errors. These errors are usually caused by the filesystem structure of linux. Ever wondered from where Linux reads these properties of a file? Also if you use symlinks (shortcuts if you are coming from windows) to a file, how is it resolved internally? When I was a beginner, I used to think that Linux reads these properties from the file itself. But then where are these properties stored in the file? It turns out, that's not the case. Linux reads these properties from a data structure called `Inode`.

You can see the files and their permissions using the `ls -l` command. The output of the `ls -l` command is shown below:

```bash
~/dotfiles $ ls -l
total 1380
-rw-r--r-- 1 funinkina funinkina    2107 Dec 19 16:23 config.jsonc
-rw-r--r-- 1 funinkina funinkina 1397572 Jan  3 00:40 default.sd.tar.gz
-rw-r--r-- 1 funinkina funinkina    3101 Aug 15 20:19 pacman.conf
-rw-r--r-- 1 funinkina funinkina    2024 Aug 18 19:22 starship.toml
```
{{< box info >}}
The `ls` commmand is used to see the files and directories in the current directory. The `-l` flag is used to see the long listing of the files and directories.
{{< /box >}}

This output gives the information about the file permissions, owner, group, size, last modified date, and the name of the file. These permissions are stored as a key-value pair in the `Inode` data structure.

Now to see the inode number of the files, we can use `ls -ia` command. The output of the `ls -ia` command is shown below:

```bash
~/dotfiles $ ls -li
total 1380
24782638 -rw-r--r-- 1 funinkina funinkina    2107 Dec 19 16:23 config.jsonc
23986866 -rw-r--r-- 1 funinkina funinkina 1397572 Jan  3 00:40 default.sd.tar.gz
24782642 -rw-r--r-- 1 funinkina funinkina    3101 Aug 15 20:19 pacman.conf
24782644 -rw-r--r-- 1 funinkina funinkina    2024 Aug 18 19:22 starship.toml
```
Let's take the file `starship.toml` as an example.
Here we see `24782644`, this is the inode number of the file `starship.toml`. You can think of this inode number as a primary key to the `Inode` data structure of this file. Let's dive deeper into the `Inode` data structure.
We can further see the properties of the file using the `stat` command. The output of the `stat` command is shown below:

```bash {hl_lines=[4]}
~/dotfiles $ stat starship.toml
  File: starship.toml
  Size: 2024      	Blocks: 8          IO Block: 4096   regular file
Device: 254,3	Inode: 24782644    Links: 1
Access: (0644/-rw-r--r--)  Uid: ( 1000/funinkina)   Gid: ( 1000/funinkina)
Access: 2025-01-28 00:35:58.670392334 +0530
Modify: 2024-08-18 19:22:06.000000000 +0530
Change: 2024-12-27 13:46:50.435495946 +0530
 Birth: 2024-12-27 13:43:10.180129427 +0530
```
Here we can see its size, inode number, how many files links to this file which is 1 in this case, access, modify, change, and birth time of the file. These properties are stored in the `Inode` data structure of the file.

## Inode in Disks
`Inode` is a special kind of data structure that stores metadata about a file. Metadata includes information like file type, file size, file owner, file permissions, file access time, file modification time, file deletion time, etc. Inodes are used to represent files and directories in the filesystem. Each inode is identified by a unique number called `inode number`.

The most popular file system partition in Linux is the `ext4` file system. In the `ext/2/3/4` or even in `UFS` file systems, the inode data structure is allocated a certain amount of space (Usually around 1% of the total disk space). This space is used to store the metadata of the file. I will discuss some issues that may arise due to the limited space allocated to the inode data structure later in this article.

You can check how much space is taken by the inode data structure using the `df -i` command. The output of the `df -i` command is shown below:

```bash
~ $ df -i
Filesystem             Inodes  IUsed    IFree IUse% Mounted on
/dev/mapper/vol-root  3276800 230296  3046504    8% /
/dev/mapper/vol-home 27639808 762127 26877681    3% /home
```
Here we can see that the root partition has `3276800` inodes and `230296` inodes are used. This means that `3046504` inodes are free. The percentage of inodes used is `8%`. If you have a linux server with thousands of files, you may run out of inodes. This can give low disk space errors even though you have plenty of space left on the disk. This is a common issue in shared hosting servers. So yes, you can run out of space and not have the ability to create new files despite having plenty of space left on the disk.

## Inode Structure
An Inode is of 256 bytes in size. Containing the following fields:

| Field |
| ---- |
| Mode |
| Link count |
| Owner's UID number |
| Owner's GID number |
| File Size in bytes |
| Time file was last accessed |
| Time file was last modified |
| Time file was last changed |
| 12 Direct block pointers (32/64 bits) to reference upto 96 KB |
| 1 Single Indirect block pointer (32/64 bits) to reference upto 16 MB |
| 1 Double Indirect block pointer (32/64 bits) to reference upto 32 GB |
| 1 Triple Indirect block pointer (32/64 bits) to reference upto 64 TB |
| Inode status (flags) |
| Count of data blocks actually held |
| (Optional) extra reserved fields |

The Inodes not only store metadata for the file but also store pointers to the disk blocks that store the file data. The disk blocks are used to store the file data. The size of the disk blocks is usually 4 KB. The Inodes store pointers to the disk blocks that store the file data. The Inodes store 15 pointers to the disk blocks that store the file data. They point from the beginning of the file upto 96 KB. If thats not enough, the Inodes store 3 types of indirect pointers to point to the disk blocks that store the file data. These indirect pointers are used to point to the blocks that store the addresses of the disk blocks that store the file data.

## Inode Pointers
The Inodes store 15 pointers to the disk blocks that store the file data. They point from the beginning of the file upto 16 MB.
If thats not enough, the Inodes store 3 types of indirect pointers to point to the disk blocks that store the file data. These indirect pointers are used to point to the blocks that store the addresses of the disk blocks that store the file data.

The pointers referred to are disk block addresses - each pointer contains the information necessary to identify a block on disk. Since each disk block is at least 512 bytes (sometimes 4096 or 8192 bytes), using 32-bit addresses the disk can address up to 512 * 4 * 10243 = 2 TiB (Tebibytes - more commonly called Terabytes) assuming 1/2 KiB blocks; correspondingly larger sizes as the block size grows (so 32 TiB at 8 KiB block size). For an addressing scheme for larger disks, you would have to move to larger block sizes or larger disk addresses - hence 48-bit or 64-bit addresses might be plausible.

### Direct Pointers
The first 12 pointers are called direct pointers. These direct pointers point to the disk blocks that store the file data. Each direct pointer is points to 8KB chunks. Therefore the maximum file size these direct pointers can represent is `12 pointers X 8 KB = 96KB` of data.
![Single Indirect Pointer](/blog-assets/direct-pointer.png)

When the file grows bigger, the disk driver allocates a single indirect block, and records that in the inode. When the driver needs to get a block, it reads the indirect block into memory, and then finds the address for the block it needs from the indirect block. Thus, it requires (nominally) two reads to get to the data, though of course the indirect tends to be cached in memory. There are three types of indirect pointers:
The indirect pointers are:
- Single Indirect Pointer
- Double Indirect Pointer
- Triple Indirect Pointer

### Single Indirect Pointer
With an 8 KiB block size and 4-byte disk addresses, you can fit 2048 disk addresses in the single indirect block. So, for files from 96 KiB + 1 byte to 16 MiB or so, there is only a single indirect block.

### Double Indirect Pointer
If a file grows still bigger, then the driver allocates a double indirect block. Each pointer in the double indirect block points to a single indirect block. So, you can have 2048 more indirect blocks, each of which can effectively point at 16 MiB, leading to files of up to 32 GiB (approx) being storable.

### Triple Indirect Pointer
If a file grows still larger, then the driver allocates a triple indirect block. Each of the 2048 pointers in a triple indirect block points to a double block. So, under the 32-bit addressing scheme with 32-bit addresses, files up to about 64 TiB could be addressed. Except that you've run out of disk addresses before that (32 TiB maximum because of the 32-bit addresses to 8 KiB blocks).

![Indirect Pointers](/blog-assets/indirect-pointers.png)

So to conclude, Indirect pointers in inodes allow modern file systems to handle large files efficiently while keeping inode structures compact. The combination of direct, single, double, and triple indirect pointers ensures scalability without introducing unnecessary overhead for smaller files.

## Links
You must have noticed that the Inode structure also stored something called a link. A link is a pointer to the file. When you create a file, a link is created in the Inode structure. When you create a hard link to a file, a new link is created in the Inode structure. When you create a symbolic link to a file, a new link is created in the Inode structure. When you delete a file, the link is removed from the Inode structure. When you delete a hard link to a file, the link is removed from the Inode structure. When you delete a symbolic link to a file, the link is removed from the Inode structure.

A link can help you to create multiple references to a file. This can be useful when you want to create a backup of a file. You can create a hard link to the file and then modify the file. The hard link will still point to the original file. This can be useful when you want to create a backup of a file. You can create a symbolic link to the file and then modify the file. The symbolic link will still point to the original file. A soft like can be useful when you want to create a shortcut to a file. You can create a symbolic link to the file and then modify the file. The symbolic link will still point to the original file. A soft link doesn't have to be in the same filesystem as the original file while a hard link has to be in the same filesystem as the original file. And a soft link can point to a directory while a hard link can't point to a directory. Soft link doesn't use any extra Inode space while a hard link uses extra Inode space.

For example for my dotfiles, I have created a symbolic link of the .zshrc file to the home directory. This way I can keep my dotfiles in a separate directory and still use them in the home directory.

```bash
lrwxrwxrwx  1 funinkina funinkina    31 Dec 23 22:34 .zshrc -> /home/funinkina/dotfiles/.zshrc
```

This way I can keep my dotfiles in a separate directory which has git [repository](https://github.com/funinkina/dotfiles) and still use them in the home directory without having to copy them to the home directory.

## Conclusion
In this article, we discussed what Inodes are and how they are used in Linux. We also discussed the structure of the Inode and how it stores metadata about the file. We also discussed how Inodes store pointers to the disk blocks that store the file data. We also discussed the different types of pointers in the Inode structure. We also discussed how links are stored in the Inode structure. We also discussed how links can be used to create multiple references to a file. We also discussed how links can be used to create a backup of a file. We also discussed how links can be used to create a shortcut to a file. We also discussed the difference between a hard link and a soft link. We also discussed how Inodes can run out of space and how it can give low disk space errors even though you have plenty of space left on the disk. We also discussed how Inodes can be used to create a backup of a file. We also discussed how Inodes can be used to create a shortcut to a file. We also discussed how Inodes can be used to create a hard link to a file. We also discussed how Inodes can be used to create a symbolic link to a file. We also discussed how Inodes can be used to create a soft link to a file. We also discussed how Inodes can be used to create a hard link to a directory. We also discussed how Inodes can be used to create a symbolic link to a directory. We also discussed how Inodes can be used to create a soft link to a directory. We also discussed how Inodes can be used to create a hard link to a file. We also discussed how Inodes can be used to create a symbolic link to a file. We also discussed how Inodes can be used to create a soft link to a file. We also discussed how Inodes can be used to create a hard link to a directory. We also discussed how Inodes can be used to create a symbolic link to a directory. We also discussed how Inodes can be used to create a soft link to a directory. We also discussed how Inodes can be used to create a hard link to a file. We also discussed how Inodes can be used to create a symbolic link to a file. We also discussed how Inodes can be used to create a soft link to a file. We also discussed how Inodes can be used to create a hard link to a directory.
