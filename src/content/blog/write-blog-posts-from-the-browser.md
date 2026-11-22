---
title: "I write my blog from the site itself, no local repo needed"
date: 2026-11-22
category: tech
series: "Backendless blog"
part: 2
tags: [github-api, encryption, static-sites]
summary: "Part 2: a hidden writing page on my own site that commits posts to GitHub, so I can publish from any browser."
draft: false
---

In [part 1](/blog/backendless-blog-with-locked-posts) I made a blog where publishing is just a `git push`. Which is cool, until you're not at your laptop. And writing, for me, doesn't wait until I'm at my laptop. Sometimes it's on my phone, sometimes on a computer that isn't mine, sometimes it's 2am and I'm not opening a terminal.

So I thought, can I just open my own website, type the post, hit a button, and it goes live? No cloning the repo, no git, nothing.

Turns out yeah, you can.

## How it works

The blog lives in a GitHub repo. GitHub has an API. A post is just a file. So "publish" is basically "ask GitHub to create a file on my branch", and the site rebuilds like it would after any push.

No backend in the middle. My browser talks to GitHub, GitHub stores the file, done.

## The writing page

It's a hidden page on my site. Not linked anywhere, and I told search engines to ignore it. It has a form for the title, date, category, tags, series and all that, and a big markdown box with a live preview next to it. There's a draft checkbox, a locked checkbox, and a tab where I can edit or delete old posts.

The page is public, because the whole site is. So the page itself isn't what keeps people out. The token is.

## The token thing

To commit to my repo the page needs a GitHub token. I made a fine-grained one that only works on this one repo, and only for reading and writing files. So if it ever leaks, the worst someone can do is mess with this repo. Annoying, but not the end of the world.

But where does it live in the browser? I really didn't want it just sitting there as plain text. So the first time on a device I paste it in and pick an editor password. The page encrypts the token with that password (same PBKDF2 and AES-GCM stuff as the locked posts) and only the encrypted version is stored. Next time I just type the password. The token is in memory only while the editor is open, and there's a "lock editor" button and a "forget this device" button, just in case.

Wrong password and it just fails. No password, no token.

## Publishing

I hit publish, the page sends the markdown file to GitHub's API, GitHub makes the commit. That's it, honestly. I added a few little things so it's nicer to use: the slug fills in from the title, an unfinished draft survives a refresh, and it knows when I'm editing an old post instead of making a new one.

## Locked posts from the browser

This is the part I cared about most. If I write a locked post here, the plain text can't ever leave my browser. So the page does what my seal script does on the laptop: renders the post, compresses it, encrypts it with my blog password. Only the scrambled JSON goes to GitHub.

It also checks my blog password against a post that's already locked, so I can't accidentally lock something with a different password and make it unreadable forever. And locked posts never get saved as drafts in the browser either.

## The scary bit: deleting from a public repo

This one I hadn't thought about at all. If I delete a public post, it's gone from the site, but it's still in the git history. And the repo is public. So anyone can go digging and find it.

For locked posts that's fine, since the old versions are just scrambled text. For public ones, I added a purge option. It rewrites the branch's history through GitHub's API so the post gets taken out of every commit, then moves the branch over to the new history. It tells me exactly what it's going to touch first and only runs on a second click, because yeah, that's a scary button.

The catch is every commit after that post gets a new hash.

## What it costs

The token is the weak spot. If someone got into my browser they could get at it. That's why it only works on one repo, it's encrypted when stored, and it's only in memory while I'm editing. I should probably add an expiry too.

Hidden isn't secret. Anyone could find the page. It's only safe because it's useless without the token.

Rewriting history is a sharp tool. I want it to stay a two-click thing so I never do it casually.

And there's no review step. It commits straight to the branch. For my own blog that's fine.

## What I'd do next

Probably an expiry on the token with a reminder to rotate it, uploading images from the editor, and drafts that sync between devices. Or none of it, it's a blog.
