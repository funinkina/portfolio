---
title : 'The Way of Arch'
date : '2025-02-03T10:14:53+05:30'
draft : false
tags : [Linux, Arch, Guide]
description : 'A guide to set up Arch Linux with a minimal installation for an optimized workflow experience.'
images:
  - /blog-assets/arch-guide-header.png
toc: true
---
![Header Image](/blog-assets/arch-guide-header.png)

# My Zenful Arch linux setup for an optimized and secure workflow
## Introduction
If it's not clear by now, I use arch btw. But you might ask, why arch linux, what's so special about it. After years of distro hopping I have realized what makes arch linux special, Its minimalism is its strength—allowing infinite customization to fit any workflow. It can be tweaked infinitely to your needs, regardless of the kind of work you do. Even if you are not an engineer, it will serve you pretty well instead of getting in your way. Though this guide is mainly targeted towards programmers. Starting with arch linux seems kinds daunting isn't it? I mean the [CLI installation](https://wiki.archlinux.org/title/Installation_guide) might indeed throw off a beginner from trying arch. But then you realise it's actually just copy pasting commands from the internet and pasting into your terminal. (Honestly, you should not run unknown scripts off of the internet without verifying).

What I've seen is that a lot of guides just cover just the basics, and leave cover the security and the post installation aspect. Sure you can refer to [arch wiki about security](https://wiki.archlinux.org/title/Security) and about post installation. Also we can't forget about security, so that's why we will cover everything from [Secure Boot](https://wiki.archlinux.org/title/Unified_Extensible_Firmware_Interface/Secure_Boot), [Full Disk Encryption](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system) to [Firewall](https://wiki.archlinux.org/title/Category:Firewalls) and passwords. But then again, how will you know what will suit your needs? Therefore this blog will act like a guide to set up arch linux with a minimal installation for an optimized workflow experience.

![Security](https://imgs.xkcd.com/comics/security.png)

## What will be the end result
After the successful completion of this guide, you should have a working Arch linux installation with the following features:
- ZSH terminal with cool features
- A fully functioning GNOME based desktop environment
- Some necessary packages for development
- Encrypted Hard-drive with auto unlock using TPM keys
- Working Secure boot configuration

----

# Installation Guide:
## 0. Booting off of the Arch Installation media
First, acquire an installation image. Visit the [download page](https://archlinux.org/download/) and, acquire the ISO file and the respective GnuPG signature, and flash it to a USB drive and boot off it.

It is recommended to verify the image signature before use, especially when downloading from an HTTP mirror, where downloads are generally prone to be intercepted to serve malicious images.

If you already have an existing Windows installation with secure boot turned on, you should turn it off as this Arch ISO won't pass that secure boot check as it is not signed with the microsoft keys.

## 1. Connecting to Internet
As you might have noticed, the ISO is fairly small compared to other OS, it's because the ISO only contains the bare bones stuff, rest will be pulled from the internet later on. Therefore having a good stable internet connection is necessary.

### Via wired ethernet
If you device is connected to wired Ethernet, you don't need to do anything else, it should automatically be configured by the installer. You can check the internet connection by pinging a website.
```bash
$ ping archlinux.org
PING archlinux.org (2a01:4f9:c010:6b1f::1) 56 data bytes
64 bytes from archlinux.org (2a01:4f9:c010:6b1f::1): icmp_seq=1 ttl=50 time=252 ms
64 bytes from archlinux.org (2a01:4f9:c010:6b1f::1): icmp_seq=2 ttl=50 time=219 ms
64 bytes from archlinux.org (2a01:4f9:c010:6b1f::1): icmp_seq=3 ttl=50 time=194 ms
64 bytes from archlinux.org (2a01:4f9:c010:6b1f::1): icmp_seq=4 ttl=50 time=207 ms
64 bytes from archlinux.org (2a01:4f9:c010:6b1f::1): icmp_seq=5 ttl=50 time=377 ms
^C
--- archlinux.org ping statistics ---
5 packets transmitted, 5 received, 0% packet loss, time 4001ms
rtt min/avg/max/mdev = 193.901/249.745/376.601/66.278 ms
```
If you see something like this, it means you are successfully connected to the internet.

### Via Wi-Fi ([archwiki](https://wiki.archlinux.org/title/Iwd))
To connect using wi-fi, follow these steps:
#### 1. Open iwctl
`iwctl`
#### 2. Inside iwctl, type
`[iwd]# device list`

It will show something like
```
[iwd]# device list
                                    Devices                                   *
--------------------------------------------------------------------------------
  Name                  Address               Powered     Adapter     Mode
--------------------------------------------------------------------------------
  wlan0                 **:**:**:**:**:**     on          phy0        station
```
If the device or its corresponding adapter is turned off, turn it on (replace name with eg `wlan0`):

`[iwd]# device name set-property Powered on`

#### 3. Connecting
To initiate a scan for networks (note that this command will not output anything):

`[iwd]# station name scan`

You can then list all available networks:

`[iwd]# station name get-networks`

Finally, to connect to a network:

`[iwd]# station name connect SSID`

If network is hidden:

`[iwd]# station name connect-hidden SSID`

You can check your connection with the `ping` command mentioned above.

## 2. Disk configuration
This is the most crucial step for the installation
We'll use a 1024MB FAT32 system partition for our EFI partition , and for the root we'll use an ext4 partition and a SWAP partition using LVM2 logical volumes inside a LUKS encrypted partition.

This is what it will look like in the end
```
NAME           MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1        259:0    0 476.9G  0 disk
├─nvme0n1p1    259:1    0     1G  0 part  /efi
└─nvme0n1p2    259:2    0 475.9G  0 part
  └─cryptlvm   254:0    0 475.9G  0 crypt
    ├─vol-swap 254:1    0     4G  0 lvm   [SWAP]
    ├─vol-root 254:2    0    50G  0 lvm   /
    └─vol-home 254:3    0 421.7G  0 lvm   /home
```
### Partitioning the disks
We will be using `cfdisk` to partition the disks as it offers a nice TUI compared to `fdisk` that is not very intuitive.
Before partitioning , the output of lsblk is gonna look something like this.
```
$ lsblk
NAME        MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
nvme0n1     259:0    0  709.5G  0 disk
```
Launch cfdisk: Open a terminal. Identify your disk. For this guide, we'll use /dev/nvme0n1 as an example. Replace it with your actual disk identifier.
```bash
cfdisk /dev/nvme0n1
```
Select the Label Type:
- Choose gpt (GUID Partition Table) if prompted.

#### Create Partitions:

- Create EFI System Partition: Select [ New ]. Enter 1024M for the size. Select [ Type ] and choose EFI System.

- Create LUKS Partition: Select [ New ]. Use the remaining disk space for this partition, or allocate the space you want , if you don't plan on using the entire disk for this setup. Ensure the type is Linux filesystem.

Write Changes:

 Select [ Write ].
 Type yes to confirm.

Visual Representation of Partition Structure:
```
+------------------+-----------------------+------------+----------------+
| Partition Number | Partition Type        | Size       | Description    |
+------------------+-----------------------+------------+----------------+
| /dev/nvme0n1p1   | EFI System            | 1024M      | EFI Partition  |
| /dev/nvme0n1p2   | Linux filesystem      | Remaining  | LUKS2 Volume   |
+------------------+-----------------------+------------+----------------+
```
After partitioning, lsblk will output the following.
```
$ lsblk
NAME        MAJ:MIN  RM  SIZE   RO TYPE MOUNTPOINT
nvme0n1     259:0    0   710G   0  disk
├─nvme0n1p1 259:1    0   1024M  0  part
└─nvme0n1p2 259:2    0   709G   0  part
```
### Creating the encrypted LUKS container
Create the LUKS encrypted container at the designated partition. Enter the chosen password twice.
``` bash
cryptsetup luksFormat /dev/nvme0n1p2
```
Open the container:
```bash
cryptsetup open /dev/nvme0n1p2 cryptlvm
```
Here cryptlvm is the name we are assigning to the encrypted container after opening it.

The decrypted container is now available at /dev/mapper/cryptlvm.

### Preparing the logical volumes

Create a physical volume on top of the opened LUKS container:
```bash
pvcreate /dev/mapper/cryptlvm
```
Create a volume group (in this example, it is named MyVolGroup, but it can be whatever you want) and add the previously created physical volume to it:
```bash
vgcreate MyVolGroup /dev/mapper/cryptlvm
```
Create all your logical volumes on the volume group:
{{< box info>}}
If a logical volume will be formatted with ext4, leave at least 256 MiB free space in the volume group to allow using e2scrub. After creating the last volume with -l 100%FREE, this can be accomplished by reducing its size with `lvreduce -L -256M MyVolGroup/home`.
{{< /box >}}

```bash
lvcreate -L 4G MyVolGroup -n swap
lvcreate -L 32G MyVolGroup -n root
lvcreate -l 100%FREE MyVolGroup -n home
lvreduce -L -256M MyVolGroup/home
```
Format your file systems on each logical volume:
```bash
mkfs.ext4 /dev/MyVolGroup/root
mkfs.ext4 /dev/MyVolGroup/home
mkswap /dev/MyVolGroup/swap
```
Mount your file systems:
```
mount /dev/MyVolGroup/root /mnt
mount --mkdir /dev/MyVolGroup/home /mnt/home
swapon /dev/MyVolGroup/swap
```
### Preparing the boot partition
```bash
mkfs.fat -F32 /dev/nvme0n1p1
```
Replace nvme0n1p1 with the drive identifier for your EFI partition.

Mount the partition to /mnt/efi:
```bash
mount --mkdir -o uid=0,gid=0,fmask=0077,dmask=0077 /dev/nvme0n1p1 /mnt/efi
```

## 3. Installing the base system

Install essential packages:
```bash
pacstrap -K /mnt base linux linux-firmware linux-headers intel-ucode vim nano efibootmgr sudo
```
{{< box info>}}
Replace `intel-ucode` with `amd-ucode` if you are using an AMD processor.
{{< /box >}}

{{< box info>}}
You can also choose `linux-lts` instead of `linux` if you want to use the LTS kernel for some extra stability as a rolling release distro might not be suitable for everyone's hardware. Just make sure to replace `linux-headers` with `linux-lts-headers` as well and `linux-lts` in the subsequent sections.
{{< /box >}}

After that is completed, we need to generate the fstab file:
```bash
genfstab -U /mnt >> /mnt/etc/fstab
```
Change root into the new system:
```bash
arch-chroot /mnt
```
Set the time zone:
```bash
ln -sf /usr/share/zoneinfo/Region/City /etc/localtime
```
Replace Region and City with your corresponding ones.

Run hwclock to generate /etc/adjtime:
```bash
hwclock --systohc
```
This command assumes the hardware clock is set to UTC.

#### Localization:

Edit `/etc/locale.gen` and uncomment en_US.UTF-8 UTF-8 and other needed UTF-8 locales.
```bash
nano /etc/locale.gen
```
Generate the locales by running:
```bash
locale-gen
```
Create the `locale.conf` file, and set the LANG variable accordingly:
```bash
touch /etc/locale.conf
```
```
/etc/locale.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
LANG=en_US.UTF-8
```
If you set the console keyboard layout, make the changes persistent in vconsole.conf:
```
/etc/vconsole.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
KEYMAP=us
```
Network configuration:

Create the `/etc/hostname` file:
Hostname is the name of your computer, it can be anything you want. like archlinux, mypc, etc.
```bash
touch /etc/hostname
```
```
/etc/hostname
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
yourhostname
```
Edit the hosts file:

Add the following lines:
```
# Static table lookup for hostnames.
# See hosts(5) for details.
127.0.0.1	localhost
::1		localhost
127.0.1.1	yourhostname.localdomain	yourhostname
```
Set the root password:
```bash
passwd
```
Create a non-root user account:
Username can be anything you want, like newuser, user, etc.
```bash
useradd -m newuser
```
Set the newuser password:
```bash
passwd newuser
```
Edit the /etc/sudoers file:

Run `visudo`:

Uncomment the following line:

Press `X` on the `#` to remove it from the beginning of the line. and press `esc` and type `:wq` to save and exit.
```
%wheel ALL=(ALL:ALL) ALL
```
Add new user to wheel group:
here `newuser` is the username you created earlier.
```bash
usermod -G wheel newuser
```

## 4. Configuring the boot loader

To build a working systemd based initramfs, modify the `HOOKS=` line in `mkinitcpio.conf` as follows:

Add the following hooks: systemd, keyboard, sd-vconsole, sd-encrypt, lvm2

`HOOKS=(base systemd autodetect microcode modconf kms keyboard sd-vconsole block sd-encrypt lvm2 filesystems fsck)`

You can skip `sd-vconsole` , if you didn't configure `/etc/vconsole.conf`. Do not regenerate the initramfs yet, as the /efi/EFI/Linux directory needs to be created first , which we will do later

## 5. Setting kernel parameters

`mkinitcpio` supports reading kernel parameters from command line files in the `/etc/cmdline.d` directory. `mkinitcpio` will concatenate the contents of all files with a `.conf` extension in this directory and use them to generate the kernel command line. Any lines in the command line file that start with a # character are treated as comments and ignored by mkinitcpio.

Create the `cmdline.d` directory:
```bash
mkdir /etc/cmdline.d
```
In order to unlock the encrypted root partition at boot, the following kernel parameters need to be set:
```
/etc/cmdline.d/root.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
rd.luks.name=device-UUID=cryptlvm root=/dev/MyVolGroup/root rw rootfstype=ext4 rd.shell=0 rd.emergency=reboot
```
You can obtain the device-UUID by running command `blkid`.

This is an example output.
```
/dev/nvme0n1p1: UUID="1234-5678" BLOCK_SIZE="512" TYPE="vfat" PARTLABEL="EFI System" PARTUUID="11111111-2222-3333-4444-555555555555"
/dev/nvme0n1p2: UUID="abcdef12-3456-7890-abcd-ef1234567890" BLOCK_SIZE="4096" TYPE="crypto_LUKS" PARTLABEL="LUKS" PARTUUID="66666666-7777-8888-9999-000000000000"
/dev/mapper/cryptlvm: UUID="12345678-90ab-cdef-1234-567890abcdef" TYPE="LVM2_member"
/dev/mapper/vg-root: UUID="abcd1234-ef56-7890-abcd-ef1234567890" BLOCK_SIZE="4096" TYPE="ext4"
/dev/mapper/vg-swap: UUID="5678abcd-90ef-1234-5678-90abcdef1234" TYPE="swap"
```
Now you need to obtain the UUID for the luks container , in our case for /dev/nvme0n1p2 which is abcdef12-3456-7890-abcd-ef1234567890

We can also add few more kernel parameters to the cmdline.d file, by appending the following lines to the file.
```
rd.udev.log_priority=2 quiet splash nmi_watchdog=0 nowatchdog mitigations=off loglevel=3 page_alloc.shuffle=1 lockdown=integrity intel_iommu=on i915.fastboot=1
```
### Explanation of the kernel parameters
- `rd.udev.log_priority=3` : This sets the log priority of the udev daemon to 2, this will only log any critical errors, improving performance overhead and boot times.
- `quiet splash` : This will suppress the kernel messages during boot, and show a splash screen instead.  This is optional, but it is recommended to keep it for a cleaner boot experience.
- `nmi_watchdog=0 nowatchdog` : Disables the NMI watchdog, which is a hardware feature that can cause the system to crash if it detects a hardware error. This is not needed for most systems, and can be safely disabled.
- `mitigations=off` : Disables the CPU mitigations for the Spectre and Meltdown vulnerabilities. This is not needed for most systems, and can be safely disabled.
- `loglevel=3` : This sets the log level of the kernel messages to 3, which will only log critical errors. This can help reduce the amount of log messages generated during boot.
- `page_alloc.shuffle=1` : This enables the page allocation shuffling feature in the kernel, which can help improve memory performance by reducing memory fragmentation.
- `lockdown=integrity` : This enables the kernel lockdown feature, which restricts the ability of user space to modify the kernel at runtime. This can help improve the security of the system by preventing malicious code from modifying the kernel.
- `intel_iommu=on` : This enables the Intel IOMMU feature, which provides hardware support for virtualization and can help improve the performance and security of virtual machines. **For amd cpus, you can use `amd_iommu=on`**.
- `i915.fastboot=1` : This enables the fastboot feature for the Intel i915 graphics driver, which can help reduce the time it takes to initialize the graphics hardware during boot. **Use this only if you have an Intel graphics card**.

## 6. Install the `systemd-ukify` and `sbsigntools`

{{< box warning>}}
It is possible for someone to mimic our root partiton's UUID, and basically, query the TPM for the encryption key, even though, it is not the actual OS. To prevent this, we can create a PCR Policy to pre-calculate what the value in PCR11 would be during the enter-initrd boot phase, and use it along with other PCR registers to verify the secure state of the system. As PCR11 is extended at various phases during boot, any attempt to query the TPM after the enter-initrd phase would be met with failure, as the expected value does not match the current value in the PCR11 register, even though all the other PCR registers have expected value.
{{< /box >}}

To do this, we need to install the systemd-ukify and sbsigntools
```bash
sudo pacman -Syu systemd-ukify sbsigntools efitools
```
`mkinitcpio` can build a UKI itself, but it prefers to use `systemd-ukify` when it is available. When building an UKI with `systemd-ukify`, it uses `systemd-measure` to automatically pre-calculate expected PCR11 values. The PCR11 values depends on the content of the UKI (see systemd-stub documentation), but PCR11 is also extended at different boot "phases". systemd-measure can be used to create and sign a policy for a specific phase.

When enrolling the secret into the TPM, our policy will be:

PCR7 must match the current value so that the Secure Boot state was not altered
PCR11 will be linked to a public key, so that the secret can be unsealed using a signed policy as long as the PCR11 value matches the value provided in the policy, and the signature matches the public key.

## 7. Configure systemd-ukify

The kernel and `initrd` section should not be explicited in the configuration, they will be automatically provided as arguments by the tool calling systemd-ukify (mkinitcpio for Arch, kernel-install for Fedora).

The .pcrpkey section will match PCRPublicKey because there is exactly one PCRPublicKey key present in the configuration. If you want to calculate other policies, as an example to seal secret that can be obtained once the system is booted, you will have to specify which public key must be included in the .pcrpkey section.

The calculated policy will be included in the .pcrsig section.

When .pcrsig and/or .pcrpkey sections are present in a unified kernel image their contents are passed to the booted kernel in an synthetic initrd cpio archive that places them in the /.extra/tpm2-pcr-signature.json and /.extra/tpm2-pcr-public-key.pem files. Typically, a tmpfiles.d line then ensures they are copied into /run/systemd/tpm2-pcr-signature.json and /run/systemd/tpm2-pcr-public-key.pem where they remain accessible even after the system transitions out of the initrd environment into the host file system. Tools such as `systemd-cryptsetup@.service`, `systemd-cryptenroll` and `systemd-creds` will automatically use files present under these paths to unlock protected resources (encrypted storage or credentials) or bind encryption to booted kernels.

Create uki.conf
```bash
sudo nano /etc/kernel/uki.conf
```
```
/etc/kernel/uki.conf
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
[UKI]
OSRelease=@/etc/os-release
PCRBanks=sha256

[PCRSignature:initrd]
Phases=enter-initrd
PCRPrivateKey=/etc/kernel/pcr-initrd.key.pem
PCRPublicKey=/etc/kernel/pcr-initrd.pub.pem
```
Generate the key for the PCR policy
```bash
sudo ukify genkey --config=/etc/kernel/uki.conf
```
## 8. Use mkinitcpio to generate the UKI

Now, modify `/etc/mkinitcpio.d/linux.preset`, as follows, with the appropriate mount point of the EFI system partition:

Here is a working example linux.preset for the linux kernel and the Arch splash screen.
```
/etc/mkinitcpio.d/linux.preset
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
# mkinitcpio preset file for the 'linux' package

#ALL_config="/etc/mkinitcpio.conf"
ALL_kver="/boot/vmlinuz-linux"

PRESETS=('default' 'fallback')

#default_config="/etc/mkinitcpio.conf"
#default_image="/boot/initramfs-linux.img"
default_uki="/efi/EFI/Linux/arch-linux.efi"
default_options="--splash /usr/share/systemd/bootctl/splash-arch.bmp"
#default_options="--splash /sys/firmware/acpi/bgrt/image" #Alternatively use this if your firmware supports this.

#fallback_config="/etc/mkinitcpio.conf"
#fallback_image="/boot/initramfs-linux-fallback.img"
fallback_uki="/efi/EFI/Linux/arch-linux-fallback.efi"
fallback_options="-S autodetect"
```
Finally, to build the UKI, make sure that the directory for the UKIs exist. For example, for the linux preset:
```bash
mkdir -p /efi/EFI/Linux
```
Now install the lvm2 package:
```bash
sudo pacman -S lvm2
```
Now, regenerate initramfs:
```bash
mkinitcpio -p linux
```

## 9. Configuring the bootloader
Since we are not dualbooting, we can use a much simple bootloader, or in this no bootloader at all. We will use EFI stub loader to boot the kernel directly from the UEFI firmware. This is the most secure way to boot the system, as it eliminates the need for a bootloader, which can be a potential attack vector.

First, we need to copy the kernel image to the EFI system partition:
```bash
cp /boot/vmlinuz-linux /efi/EFI/Linux/arch-linux.efi
cp /boot/initramfs-linux.img /boot/efi/EFI/arch/initramfs-linux.img
```

Then, we need to create a boot entry in the UEFI firmware. This can be done using the `efibootmgr` command. First, we need to find the device path of the EFI system partition. This can be done using the `lsblk` command:
```bash
lsblk
```
Look for the `/efi` partition, and note the device path. For example, if the device path is `/dev/nvme0n1p1`, you can create a boot entry using the following command:
```
NAME           MAJ:MIN RM   SIZE RO TYPE  MOUNTPOINTS
nvme0n1        259:0    0 476.9G  0 disk
├─nvme0n1p1    259:1    0     1G  0 part  /efi
└─nvme0n1p2    259:2    0 475.9G  0 part
  └─cryptlvm   254:0    0 475.9G  0 crypt
    ├─vol-swap 254:1    0     4G  0 lvm   [SWAP]
    ├─vol-root 254:2    0    50G  0 lvm   /
    └─vol-home 254:3    0 421.7G  0 lvm   /home
```
Here the EFI system partition is `/dev/nvme0n1p1`. You can create a boot entry using the following command:
```bash
efibootmgr --disk /dev/nvme0n1 --part 1 --create --label "Arch Linux" --loader /EFI/Linux/arch-linux.efi
```
Replace `/dev/nvme0n1` with the device path of the disk containing the EFI system partition and 1 with the partition number of the EFI system partition.

## 10. Installing the GNOME desktop environment
First install network manager and enable it to manage the network connections:
```bash
sudo pacman -S networkmanager && systemctl enable NetworkManager
```
Then install the GNOME desktop environment:
```bash
sudo pacman -S gnome gnome-tweaks gnome-shell-extensions
```
Enable the GDM service:
```bash
sudo systemctl enable gdm
```

{{< box important>}}
For the next step, we need to store the secure boot keys, therefore, turn off the system and disable the secure boot from the BIOS settings and clear any stored keys.For most systems, you can do this by, just going into BOOT tab, enabling secure boot, go to SECURITY tab and do Erase all secure boot settings.

Now save changes and exit.

Now when booting into Arch Linux you'll be prompted to enter the passphrase to your LUKS partition.
{{< /box >}}

## 11. Enrolling the secure boot keys
At this point, you should have booted and logged into the GNOME desktop environment.

Now to configure secure boot , first install the sbctl utility:
```bash
sudo pacman -S sbctl
```
{{< box info>}}
It might say completed installation with some errors, that's fine because sbctl can't find the key database, because there never was one.
{{< /box >}}
Now run sbctl status and ensure setup mode is enabled.

Then create your secure boot keys with:
```bash
sudo sbctl create-keys
```
Enroll the keys, with Microsoft's keys, to the UEFI:
```bash
sudo sbctl enroll-keys -m --firmware-builtin --tpm-eventlog
```
{{< box info>}}
Options

`-m, --microsoft`
Enroll UEFI vendor certificates from Microsoft into the signature database. See Option ROM*.

`-t, --tpm-eventlog`
Enroll checksums from the TPM Eventlog into the signature database.

See Option ROM*.

This feature is experimental

`-f, --firmware-builtin`
Enroll signatures from dbDefault, KEKDefault or PKDefault. This is usefull if sbctl does not vendor your OEM certificates, or doesn’t include all of them.
{{< /box >}}

Valid values are "db", "KEK" or "PK" passed as a comma
delimitered string.

Default: `"db,KEK"`

{{< box warning>}}
If using the flag `--tpm-eventlog`, results in a warning or error, just ignore it. It means that operation is not supported on your specific device. Trying to force it can soft brick your device.
Some firmware is signed and verified with Microsoft's keys when secure boot is enabled. Not validating devices could brick them. To enroll your keys without enrolling Microsoft's, run: `sbctl enroll-keys`. Only do this if you know what you are doing.
{{< /box >}}

Check the secure boot status again

`sbctl` should be installed now, but secure boot will not work until the boot files have been signed with the keys you just created.

Check what files need to be signed for secure boot to work:
```bash
sudo sbctl verify
```
Now sign all the unsigned files. Most probably these are the files you need to sign:
```
/efi/EFI/BOOT/BOOTX64.EFI
/efi/EFI/Linux/arch-linux-fallback.efi
/efi/EFI/Linux/arch-linux.efi
/efi/EFI/systemd/systemd-bootx64.efi
```
The files that need to be signed will depend on your system's layout, kernel and boot loader.
```bash
$ sbctl sign --save /efi/EFI/BOOT/BOOTX64.EFI
$ sbctl sign --save /efi/EFI/Linux/arch-linux-fallback.efi
$ sbctl sign --save /efi/EFI/Linux/arch-linux.efi
$ sbctl sign --save /efi/EFI/systemd/systemd-bootx64.efi
```
The `--save flag` is used to add a pacman hook to automatically sign all new files whenever the Linux kernel, systemd or the boot loader is updated.

Now reboot, and verify that Secure Boot is enabled by using command bootctl
```
bootctl
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
System:
      Firmware: UEFI
 Firmware Arch: x64
   Secure Boot: enabled (user)
  TPM2 Support: yes
  Measured UKI: yes
  Boot into FW: supported
```
Optionally, remove any leftover initramfs-*.img from /boot or /efi.

## 12. Enrolling the TPM

Make sure Secure Boot is active and in user mode when binding to PCR 7, otherwise, unauthorized boot devices could unlock the encrypted volume. The state of PCR 7 can change if firmware certificates change, which can risk locking the user out. This can be implicitly done by fwupd or explicitly by rotating Secure Boot keys.

To begin, run the following command to list your installed TPMs and the driver in use:
```bash
systemd-cryptenroll --tpm2-device=list
```
First, let's generate a recovery key in case it all gets messed up some time in the future:
```bash
sudo systemd-cryptenroll /dev/nvme0n1p2 --recovery-key
```
Save or write down the recovery key in some safe and secure place.

To check that the new recovery key was enrolled, dump the LUKS configuration and look for a systemd-tpm2 token entry, as well as an additional entry in the Keyslots section:
```bash
cryptsetup luksDump /dev/nvme0n1p2
```
It will most probably be in keyslot 1.

We'll now enroll our system firmware and secure boot state. This would allow our TPM to unlock our encrypted drive, as long as the state hasn't changed.
``` bash
sudo systemd-cryptenroll --tpm2-device=auto --tpm2-pcrs=0+7 --tpm2-public-key /etc/kernel/pcr-initrd.pub.pem /dev/nvme0n1p2
```
{{< box warning>}}
**Warning:** It is recommended to use a pin to unlock the TPM, instead of allowing it to unlock automatically, for more security.
Add `--tpm2-with-pin=yes` flag in the above command to enable it. You will be prompted to enter a pin when unlocking the volume.
When enrolling a TPM2 device, controls whether to require the user to enter a PIN when unlocking the volume in addition to PCR binding, based on TPM2 policy authentication. Defaults to "no". Despite being called PIN, any character can be used, not just numbers.
Note that incorrect PIN entry when unlocking increments the TPM dictionary attack lockout mechanism, and may lock out users for a prolonged time, depending on its configuration. The lockout mechanism is a global property of the TPM, systemd-cryptenroll does not control or configure the lockout mechanism. You may use tpm2-tss tools to inspect or configure the dictionary attack lockout, with tpm2_getcap(1) and tpm2_dictionarylockout(1) commands, respectively.
{{< /box >}}

{{< box info>}}
**Note:** Including PCR0 in the PCRs can cause the entry to become invalid after every firmware update. This happens because PCR0 reflects measurements of the firmware, and any update to the firmware will change these measurements, invalidating the TPM2 entry. If you prefer to avoid this issue, you might exclude PCR0 and use only PCR7 or other suitable PCRs.
{{< /box >}}
Info on all additional PCRs can be found [here](https://wiki.archlinux.org/title/Trusted_Platform_Module#Accessing_PCR_registers).

If all is well, reboot , and you won't be prompted for a passphrase, unless secure boot is disabled or secure boot state has changed.

This finishes the system installation part. Now lets move on to the post installation steps.

## 13. Installing packages
```bash
sudo pacman -S firefox zsh zed pyenv python-pip ufw git base base-devel
```
This will install firefox, zed text editor, zsh shell, pyenv, python-pip, ufw, git, base and base-devel packages. Let's go through each of them.

## Git, base and base-devel
Git is a distributed version control system that is widely used for source code management. It is used to track changes in source code during software development. It is an essential tool for developers and is widely used in the open-source community. It is also used by many packages as their dependencies, so it will come in handy regardless. Base and base-devel are essential packages that are required for building and compiling software from source. They contain essential tools and libraries that are required for building software on Arch Linux like gcc, make, etc.

### Zed
[Zed](https://zed.dev/) is an awesome replacement for VS Code if you are not a fan of Microsoft products. It is a fully featured text editor with support for multiple languages, themes, and plugins. It is written in Rust and is very fast unlike VS code that is written in electron.
![Zed Editor](/blog-assets/zed.png)

### Pyenv
[Pyenv](https://github.com/pyenv/pyenv) is a simple python version management tool. It allows you to easily switch between different versions of python on your system. Comes in really handy while working on multiple projects that require different versions of python, and saves you from going to dependency hell. To add proper support for pyenv, add the following to your `.zshrc` file.
```bash
[[ -d $PYENV_ROOT/bin ]] && export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
```

### Python-pip
Pretty sure its very self explanatory. It is the package installer for python. But it is not recommended to use it to install python packages. Instead use the native packages from the package manager that are present like `python-<package-name>`. But if you still want to use `pip`, you will encounter an `EXTERNALLY-MANAGED-ENVIRONMENT` error. To fix this:
```bash
sudo rm -rf /usr/lib/python3.13/EXTERNALLY-MANAGED
```
You can replace python3.13 with your python version in your system.

### UFW
UFW stands for Uncomplicated Firewall. It is a simple and easy-to-use firewall configuration tool for Linux. It is highly recommended to enable this as it protects your system from network attacks. It is a front-end for iptables and is particularly well-suited for host-based firewalls. To enable UFW, run the following commands:
```bash
sudo pacman -S ufw && sudo systemctl enable --now ufw
```

### Setting up AUR
While pacman is an excellent tool for managing packages from the official Arch repositories, it lacks support for the AUR, which is where the majority of user-contributed packages reside. This is where AUR helpers such as yay and paru come in. While these tools make installing AUR packages easier, they are external tools that don't integrate seamlessly with pacman, potentially introducing dependency conflicts or package management issues. Aura, on the other hand, aims to address this by providing a more integrated approach.


AUR stands for Arch User Repository, it is a community-driven repository for Arch users. It contains packages that are not available in the official repositories. To install packages from AUR, you need an AUR helper. There are many AUR helpers available, but the most popular one is `yay`. Yay is an AUR helper that uses the `pacman` syntax and can install packages from AUR with ease, so you don't have to manually clone the repositories and compile the packages yourself.

To install yay, first install the `base-devel` package group:
```bash
sudo pacman -S base-devel
```
Then, clone the yay repository from AUR and compile it:
```bash
git clone https://aur.archlinux.org/yay-bin.git
cd yay-bin
makepkg -si
```
Now you can use yay to install packages from AUR:
```bash
yay -S package-name
```

## 14. Setting up zsh
To use zsh, we first have to change the default shell to zsh from bash. To do this, run the following command:
```bash
chsh -s /bin/zsh
```
Restart your terminal, and you should be in zsh now.

And install starship prompt for zsh:
Starship is a minimal, blazing-fast, and infinitely customizable prompt for any shell! It is written in Rust and is very fast.
```bash
curl -sS https://starship.rs/install.sh | sh
```

### Configuring zsh
To configure zsh, you can create a `.zshrc` file in your home directory and add the following configuration:
First we install zinit, a modern zsh plugin manager. It will be used to manage the zsh plugins. This will eliminate the need to clone the plugins manually or to manually install it from the repositories. Add this to top of your `.zshrc` file.
```
ZINIT_HOME="${XDG_DATA_HOME:-${HOME}/.local/share}/zinit/zinit.git"
[ ! -d $ZINIT_HOME ] && mkdir -p "$(dirname $ZINIT_HOME)"
[ ! -d $ZINIT_HOME/.git ] && git clone https://github.com/zdharma-continuum/zinit.git "$ZINIT_HOME"
source "${ZINIT_HOME}/zinit.zsh"
```
This will automaticallt install zinit in the `~/.local/share/zinit/zinit.git` directory.

Then let's set some important variables
```
export PATH=$PATH:/home/username/.local/bin
export LANG=en_IN.UTF-8
export LC_ALL=en_IN.UTF-8
```
Change `username` and locale according to your system.

Now let's enable the plugins. Add this to your `.zshrc` file.
```
zinit light zsh-users/zsh-syntax-highlighting
zinit light zsh-users/zsh-completions
zinit light zsh-users/zsh-autosuggestions
fpath+=~/.zfunc

autoload -U compinit && compinit
```
This will enable syntax highlighting, completions and autosuggestions in zsh.
Also let's set up settings for the shell
```
HISTSIZE=2000
HISTFILE=~/.zsh_history
SAVEHIST=$HISTSIZE
HISTDUP=erase
HISTIGNORE="ls*:pwd*:c:clear"
setopt appendhistory
setopt sharehistory
setopt hist_ignore_space
setopt hist_ignore_dups
setopt hist_ignore_all_dups
setopt hist_find_no_dups

#completion styling
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Za-z}'

# Enable color support of ls and also add handy aliases
if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
    alias ls='ls --color=auto'
    alias ll='ls -alF'
    alias la='ls -A'
    alias l='ls -CF'
fi
```
This will set the following:
- History size to 2000
- History file to `.zsh_history`
- Ignore duplicate commands in history
- Ignore space in history
- Ignore duplicates in history
- Completion styling
- Enable color support for ls
- Add handy aliases for ls


Then set up some keybindings
```
bindkey '^f' autosuggest-accept
bindkey '^p' history-search-backward
bindkey '^n' history-search-forward
bindkey  "^[[H"   beginning-of-line
bindkey  "^[[F"   end-of-line
bindkey  "^[[3~"  delete-char
```
Now you can:
- Press `Ctrl + f` to accept the autosuggestion.
- Press `Ctrl + p` to search backward in history.
- Press `Ctrl + n` to search forward in history.
- Press `Home` to go to the beginning of the line.
- Press `End` to go to the end of the line.
- Press `Delete` to delete a character.

If you are developer, and the terminal is your second home, you need to set these aliases to make your life easier
```
alias yeet="sudo pacman -Rcnus"
alias update="yay"
alias get="yay -S"
alias search="pacman -Ss"
alias list="pacman -Q | grep"
alias info="pacman -Qi"
alias edit="sudo vim"
alias sse="sudo systemctl enable"
alias ssd="sudo systemctl disable"
alias sstart="sudo systemctl start"
alias sstop="sudo systemctl stop"
alias c="clear"
alias e="exit"
alias s="sudo"
alias ..="cd .."
alias ...="cd ../.."
alias ~="cd ~"
alias ll="ls -alF"  # Detailed listing with file types
alias la="ls -A"  # List all except . and ..
alias l="ls -CF"  # List only directories
alias gc="git clone"
alias cdir='cd "${_%/*}"'
alias python="python3"
```
This list is just what I use, you can add or remove aliases according to your needs.

## 15. Configuring Starship prompt
Don't you want to be greeted neatly everytime you open your terminal? This is what my terminal looks like with starship prompt.
![Starship prompt](/blog-assets/starship-prompt.png)
To configure starship prompt, add the following to the end of your `.zshrc` file.
```bash
eval "$(starship init zsh)"
```

Then to theme it as per my screenshot, create a `~/.config/starship.toml` file and add the following configuration:

```toml
[username]
style_user = "green bold"
style_root = "red bold"
format = "[$user]($style) "
disabled = false
show_always = true

[hostname]
ssh_only = false
format = 'on [$hostname](bold yellow) '
trim_at = "."
disabled = false

# Replace the "❯" symbol in the prompt with "➜"
[character]                            # The name of the module we are configuring is "character"
success_symbol = "[\\$](bold green)"     # The "success_symbol" segment is being set to "➜" with the color "bold green"
error_symbol = "[✗](bold red)"
#  
# configure directory
[directory]
read_only = " "
truncation_length = 10
truncate_to_repo = true # truncates directory to root folder if in github repo
style = "bold italic blue"

[cmd_duration]
min_time = 4
show_milliseconds = false
disabled = false
style = "bold italic red"

[aws]
symbol = "  "

[conda]
symbol = " "

[dart]
symbol = " "

[docker_context]
symbol = " "
format = "via [$symbol$context]($style) "
style = "blue bold"
only_with_files = true
detect_files = ["docker-compose.yml", "docker-compose.yaml", "Dockerfile"]
detect_folders = []
disabled = false

[elixir]
symbol = " "

[elm]
symbol = " "

[git_branch]
symbol = " "

[golang]
symbol = " "

[hg_branch]
symbol = " "

[java]
symbol = " "

[memory_usage]
symbol = "󰍛 "

[package]
symbol = "󰏗 "

[perl]
symbol = " "

[php]
symbol = " "

[python]
symbol = " "
pyenv_version_name = true
format = 'via [${symbol}python (${version} )(\($virtualenv\) )]($style)'
style = "bold yellow"
pyenv_prefix = "venv "
python_binary = ["./venv/bin/python", "python", "python3", "python2"]
detect_extensions = ["py"]
version_format = "v${raw}"

[ruby]
symbol = " "

[rust]
symbol = " "
```
Reload your terminal, and you should see the beautiful starship prompt.

#### Check out rest of the dotfiles in [my repository](https://github.com/funinkina/dotfiles)


## 16. Improving Arch Linux
### Pacman Tweaks
The way to install packages in Arch is by using pacman. You configure it to be faster and more verbose by uncommenting the following lines in `/etc/pacman.conf`:
```
Color
VerbosePkgLists
ParallelDownloads = 5 # to download multiple packages at once
```
and add
```
ILoveCandy
```
to make pacman more fun.

If you suffer from slow download speeds, you can use reflector to find the fastest mirrors. Install reflector by:
```bash
sudo pacman -S reflector
```
Then run the following command to update the mirrorlist:
```bash
sudo reflector --country 'India' --latest 5 --age 2 --fastest 5 --protocol https --sort rate --save /etc/pacman.d/mirrorlist
```
replace `India` with your nearest mirror source, and `5` with the number of mirrors you want to fetch.

### Speeding up boot
You can also speed up the boot process a bit by using a different compression algorithm. Edit the `/etc/mkinitcpio.conf` and update the `COMPRESSION` line to:
```
COMPRESSION="zstd"
COMPRESSION_OPTIONS=(-1)
```
Then regenerate the initramfs:
```bash
sudo mkinitcpio -P
```

## 17. GNOME Tweaks
You probably spend hours in a IDE watching a monospaced font. There it should be optimised too. I personally use Zed with martian-mono nerd fonts. Which you can install from the AUR by:
```bash
yay -S ttf-martian-mono
```
Then open GNOME tweaks app, which we installed when installing GNOME and set the Monospace font to `Martian Mono` from the fonts section. Then in Zed editor, add this line to `~/.config/zed/settings.json`
```json
"buffer_font_family": "MartianMono Nerd Font Propo"
```
### Consistent Theming
In gnome, some apps are in GTK3, and some are in GTK4, it can cause inconsistencies in the look of the two apps, you can make it more consistent by installing theme that will make the GTK3 apps look more modern
```bash
yay -S adw-gtk-theme-git
```
Then open gnome-tweaks, and set the legacy applications theme to adw-gtk or adw-gtk-dark

### Extensions
As you must have seen, GNOME desktop environment isn't that fancy, infact its really basic. So we need some extensions to add more functionality.

First install
```bash
sudo pacman -S gnome-browser-connector
```
and then visit the [extensions page](https://extensions.gnome.org/), it will prompt you to install a addon/extension, install it. Now you can add any extension from the page.

My personal highly recommended ones are:
- [Dash to Dock](https://extensions.gnome.org/extension/307/dash-to-dock/): It adds a dock to the bottom of the screen that is easily accessible with a mouse hover at the bottom
![Dash to dock](/blog-assets/dash-to-dock.png)
You can browse the for the ones that suits your needs on the page.
- [Bluetooth Battery Meter](https://extensions.gnome.org/extension/6670/bluetooth-battery-meter/): Adds a handy icon in the top bar to show the battery percentage of the connected bluetooth devices.

### Nautilus extensions
The default file manager of GNOME - Nautilus is also very customisable due to its python keybindings. Some recommended ones are:
- [nautilus-checksums](https://aur.archlinux.org/packages/nautilus-checksums): You can see SHA1, SHA256, MD5 hashes of the file in the properties section instead of using a CLI
- [nautilus-open-any-terminal](https://aur.archlinux.org/packages/nautilus-open-any-terminal): You can open a folder in any terminal of your choice, which reminds me, there is a much better terminal than the gnome console.

### Terminal
[Ptyxis](https://gitlab.gnome.org/chergert/ptyxis) is a beautiful GTK4 terminal that integrates really well into the GNOME desktop. It's much more customisable than gnome console
![Ptyxis terminal](/blog-assets/ptyxis-example.png)
You can install it from AUR by:
```bash
yay -S ptyxis
```

You can also configure nautilus to include `Open in Ptyxis` in the menu with the help if extensions mentioned earlier.
```bash
gsettings set com.github.stunkymonkey.nautilus-open-any-terminal terminal ptyxis
```

## Closing thoughts
This is the end of the guide. You have successfully installed Arch Linux with full disk encryption, secure boot, TPM2.0, GNOME desktop environment, and a lot of customisations. You can now use this system as your daily driver, and enjoy the benefits of Arch Linux. If you have any questions or suggestions, feel free to leave a comment below. I hope this guide was helpful to you. Thank you for reading!

## References
- [Arch Linux Installation Guide](https://wiki.archlinux.org/title/Installation_guide)
- [Arch Linux Security](https://wiki.archlinux.org/title/Security)
- [Arch Linux TPM2.0](https://wiki.archlinux.org/title/Trusted_Platform_Module)
- [Arch Linux Encrypting an Enitre System](https://wiki.archlinux.org/title/Dm-crypt/Encrypting_an_entire_system)
- [Arch Linux Secure Boot](https://wiki.archlinux.org/title/Secure_Boot)
- [Arch Linux zsh](https://wiki.archlinux.org/title/Zsh)
- [Starship config](https://starship.rs/config/)
- [ZINIT](https://github.com/zdharma-continuum/zinit?tab=readme-ov-file#manual)
