---
title: "I made a blog with no backend, and some posts are locked"
date: 2026-11-22
category: tech
series: "Backendless blog"
part: 1
tags: [astro, encryption, static-sites]
summary: "Publishing is just a git push. Some posts stay private even though the repo is public. Here's how it works."
draft: false
---

Writing is my hobby, and honestly it's also my coping mechanism. It's where my emotions go when they need somewhere to go. So I wanted a proper place for it. Not a "content strategy" kind of blog, just somewhere to dump random writing. Travel, tech, whatever is on my mind.

Some of it will be a series, like a prelude before a solo trip and then a diary entry for each leg. Some of it will be a one-off thought about code. And some of it is personal, stuff I want to write but not hand to the whole internet.

I didn't want a server running for any of this. No database, no CMS, no login page to maintain. I just wanted to write a file, do a `git push`, and have it show up.

## The easy part

Every post is one markdown file in the repo. At the top there's a small block that says what it is:

```md
---
title: "Solo travel diary 1"
date: 2026-11-05
category: travel
series: "Solo travel"
part: 2
summary: "One line for the card."
draft: false
---

Normal **markdown** below.
```

The site reads that block and builds the rest: a `/blog` page, category pages, series pages, a "Part 2 of 5" box on each article and previous/next links. It also makes an RSS feed. The folders are simple:

```
src/content/blog/      public posts, committed as they are
src/content/sealed/    locked posts, committed as scrambled JSON
private/               plain text of locked posts, never committed
```

Drafts are just `draft: true`, so they show up on my laptop but not on the real site. I also made a small script that creates a post from a template, so every post starts in the same format:

```bash
bun run new -- "Solo travel diary 1" --private --category travel --series "Solo travel" --part 2
```

Honestly this part took no time. Static sites have been doing this forever.

## The part I actually wanted

Problem: my GitHub repo is public. So if I commit a "private" post and just hide it on the site, anyone can open the repo and read it. That's not private, that's just a bit hidden.

I also thought for a sec, okay, encrypt it when the site builds. But that doesn't work either, because the original file is still sitting in git.

So the rule became: **the plain text never goes into git. Only the scrambled version does.**

How it works:

1. I write the post in `private/`, which git ignores.
2. I run `bun run seal`. It asks for my password and encrypts the post into a JSON file.
3. I commit only that JSON.
4. On the site, the post shows a password box. The browser decrypts it right there. The password never goes to a server, because there is no server.

This is the file that ends up on GitHub (cut short):

```json
{
  "title": "Solo travel diary 1",
  "date": "2026-11-05",
  "category": "travel",
  "series": "Solo travel",
  "part": 2,
  "iter": 600000,
  "salt": "QwelkpdmgdLylXkInH5WpQ==",
  "iv": "ZLfWIV6WGGYi2528",
  "ct": "Y4BEsfJTms7omYZOBP0XxrZwGXtN/OmVyAHiUeDisIJs..."
}
```

Title, date and series stay readable so the lists and series box can work. The actual writing is the `ct` part, and without the password it's just noise.

### How it unlocks

The browser already ships everything needed, so I didn't use a library. The password goes through PBKDF2 to become a key, and AES-GCM decrypts the post:

```ts
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
  base, { name: "AES-GCM", length: 256 }, false, ["decrypt"],
);
const zipped = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
```

A wrong password doesn't show you garbage, it just fails, because AES-GCM checks the data wasn't tampered with. I also compress the post before encrypting, so the files stay small. You enter the password once per tab, and after that the other locked posts open on their own.

It worked on the first try, which made me suspicious enough that I double checked it.

## Choices I made (and what they cost)

- **One password for everything.** Easier for me and for anyone I give it to. The downside is I can't share a single post, and if the password leaks, everything opens. The seal script even checks my password against the posts I've already locked, so I can't accidentally use two.
- **Titles can stay public or hidden.** A locked post can show up in the list as just "Private entry" until you unlock it.
- **The encrypting happens on my laptop, not in the build.** The build can only see what's already in git, so it's too late by then. As a safety net, the build fails if a public post is marked `encrypted: true`.
- **Locked posts stay out of the RSS feed and sitemap**, and the page tells search engines not to index it.
- **It's only as strong as the password.** Anyone can download the encrypted file and keep guessing offline. So a long passphrase matters. This is a lock on a diary, not a bank vault.
- **If I lose the password, those posts are gone.** No reset button. The plain text in `private/` is the only backup.

## Is this new?

Nope. Git blogs are everywhere, and there are tools that password-protect static pages. StatiCrypt is the one I know of. I just liked putting it together in one blog: normal posts, series, categories, and individual locked posts, all from a public repo.

## What I'd do next

- A password per post, so I could share one entry without the rest.
- A tougher way of turning the password into a key (scrypt or Argon2), if I ever lock something really sensitive.
- Smarter handling of photos, since they make locked posts big.

If you want to poke at it, it's all in my portfolio repo: [github.com/tejas-k3/tejas-kothari-portfolio](https://github.com/tejas-k3/tejas-kothari-portfolio). This feature was built with AI-assisted development.

Next up, part 2: how I write and publish posts from the site itself, without a local copy of the repo.
