# Team Onboarding Guide

This one file has everything you need: where to find your work, how to set up your laptop, what to build, and how to save/share your code on GitHub. Read it top to bottom once, then just follow it along as you go.

---

## 1. Who Works Where

| Role | Person | Folder |
|---|---|---|
| Backend & Integration Lead | Shlok | `backend/` (core API, models, cross-module pipeline) |
| Marketplace Frontend Dev | Srijan | `frontend/src/modules/marketplace/` |
| Marketplace Backend Dev | Shubham | `backend/src/controllers/marketplaceController.js`, `orderController.js`, `backend/src/routes/marketplaceRoutes.js`, `orderRoutes.js` |
| QR Certification Dev | Shriyam | `frontend/src/modules/certification/` |
| Farmer Advisory Dev | Shreya Jaiswal | `frontend/src/modules/advisory/` |
| UI/UX + Presentation Lead | Shreya Rastogi | `frontend/src/modules/shared/`, pitch deck, demo video |

**Rule of thumb:** stay inside your assigned folder/files. Need something in `shared/` or a backend model changed? Message the owner instead of editing it yourself — this keeps everyone's work conflict-free on Git.

---

## 2. One-Time Computer Setup (everyone)

### Install Node.js
Download from https://nodejs.org (choose the **LTS** version), install with default options.
Check it worked — open a terminal and run:
```
node --version
npm --version
```
Both should print a version number.

### Install VS Code
https://code.visualstudio.com — default install.

### Install Git
https://git-scm.com/downloads — default install.
Check with:
```
git --version
```

### Set your Git identity (run once, ever)
```
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### VS Code Extensions to install (search in the Extensions tab)
- **ESLint**
- **Prettier - Code formatter**
- **ES7+ React/Redux/React-Native snippets** (frontend folks — optional but helpful)

---

## 3. Get the Project

Shlok will add you as a collaborator on GitHub by email/username — accept that invite first (check your email).

Open a terminal, go to a folder like Desktop, and run:
```
git clone https://github.com/shlokgitt/SIH.git
cd SIH
```

### If you're on the frontend (Srijan, Shriyam, Shreya J., Shreya R.):
```
cd frontend
npm install
```

### If you're Shubham (backend):
```
cd backend
npm install
```
Then **message Shlok directly** to get the `.env` file contents (database credentials) — this is never on GitHub for security reasons. Create a file named `.env` inside `backend/` and paste in what he sends.

---

## 4. Run the Project Locally

### Frontend folks:
```
npm run dev
```
It'll print a URL like `http://localhost:5173` — open that in your browser. You should see the starter page. If you see that, it's working. Keep this terminal open while you work — it auto-refreshes on save.

### Shubham (backend):
```
npm run server
```
You should see:
```
MongoDB connected: ...
Server running on port 5000
```
Test it worked by opening `http://localhost:5000/api/health` in your browser.

If either of these show an error instead, screenshot it and send to Shlok.

---

## 5. What Each Person Builds

### Srijan — Marketplace (`frontend/src/modules/marketplace/`)
- Batch browse/listing page — pulls from `GET /api/marketplace/batches`
- Batch detail page — `GET /api/marketplace/batches/:id`
- Order placement form — `POST /api/orders`
- Distance/location-based sort or filter UI

### Shriyam — QR Certification (`frontend/src/modules/certification/`)
- QR scan page (use the `html5-qrcode` npm package)
- Certificate detail view — `GET /api/batches/:id/certificate`
- Compliant / Non-compliant visual badge

### Shreya Jaiswal — Farmer Advisory (`frontend/src/modules/advisory/`)
- Crop type + land area + soil type input form
- Results display (recommended kg/acre, total kg, usage tips)
- Calls `POST /api/advisory/calculate`

### Shreya Rastogi — Shared + Presentation (`frontend/src/modules/shared/`)
- Shared Button, Card, Input, Navbar, Footer components
- Global color palette / theme file
- Loading spinners, error states
- Overall layout wrapper
- Pitch deck, demo video, judge Q&A prep

### Shubham — Marketplace Backend (`backend/src/controllers/`)
- Extend `marketplaceController.js` and `orderController.js` (order management, scheduling logic, buyer-plant matching)
- Starter code already exists from Shlok — read it first, extend it, don't rewrite from scratch
- **Do not edit** `User.js`, `Batch.js`, or `Order.js` models without checking with Shlok first — other people's work depends on these staying stable

Full request/response details for every API endpoint are in `backend/README.md`.

---

## 6. React Basics (for frontend folks — skip if you're Shubham)

Every screen you build is a "component" — a function that returns HTML-like code (JSX).

**Basic component:**
```tsx
function MyComponent() {
  return (
    <div>
      <h1>Hello!</h1>
      <p>This is my component.</p>
    </div>
  );
}

export default MyComponent;
```

**With state** (data that changes, like an input or a counter):
```tsx
import { useState } from "react";

function MyComponent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}

export default MyComponent;
```

**Fetching data from the backend:**
```tsx
import { useState, useEffect } from "react";

function MyComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/marketplace/batches")
      .then((res) => res.json())
      .then((result) => {
        setData(result.batches);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      {data.map((item) => (
        <div key={item._id}>{item.batchCode}</div>
      ))}
    </div>
  );
}

export default MyComponent;
```

Copy this pattern and adjust the URL/fields for whatever you're building — you don't need to memorize it.

---

## 7. The Golden Rule of Git: Never Work Directly on `main`

`main` is the official, working version. Everyone works on their own **branch** — a private copy where your changes don't affect anyone else until you deliberately share them.

### Create your branch (once, before you start coding):
```
git checkout -b your-branch-name
```

Suggested branch names:
| Person | Branch name |
|---|---|
| Srijan | `frontend-marketplace` |
| Shubham | `backend-marketplace` |
| Shriyam | `frontend-certification` |
| Shreya Jaiswal | `frontend-advisory` |
| Shreya Rastogi | `frontend-shared` |

---

## 8. Daily Workflow

**A. Get the latest `main` before starting work:**
```
git checkout main
git pull origin main
```

**B. Switch back to your branch and bring in those updates:**
```
git checkout your-branch-name
git merge main
```

**C. Code as normal in VS Code.**

**D. Save your progress often (not just once at the end of the day):**
```
git add .
git commit -m "Short description of what you just did"
```

**E. Upload your branch to GitHub:**
```
git push origin your-branch-name
```
(First push on a new branch: use `git push -u origin your-branch-name`)

---

## 9. Sharing Your Work (Pull Requests)

Once your feature works and you want it added to the official version:

1. Go to https://github.com/shlokgitt/SIH in your browser
2. Click **Compare & pull request** (usually shows as a yellow banner after you push), or go to **Pull requests → New pull request** and pick your branch
3. Write a short title/description
4. Click **Create pull request**
5. Shlok reviews and merges it

Once merged, everyone else pulls it into their own branch using step 8A above.

---

## 10. Merge Conflicts

Happens when two people changed the same lines of the same file. VS Code will show markers like `<<<<<<<`, `=======`, `>>>>>>>` in the file. Pick the correct version (or combine), delete the marker lines, save, then:
```
git add .
git commit -m "Resolve merge conflict"
git push origin your-branch-name
```
If unsure what to keep, ask the team before pushing.

---

## 11. Quick Command Reference

| What you want to do | Command |
|---|---|
| Check which branch you're on | `git status` |
| See change history | `git log --oneline` |
| Switch branches | `git checkout branch-name` |
| Create AND switch to new branch | `git checkout -b branch-name` |
| See all branches | `git branch -a` |
| Undo changes to a file (before committing) | `git checkout -- filename` |

---

## 12. If Something Breaks

- **Red squiggly lines in VS Code** — hover over it, usually a typo or missing import
- **Terminal shows an error** — read it, it names the exact file/line
- **Stuck for more than 15-20 minutes** — message the team group. Someone's probably hit the same thing.

---

## 13. Golden Rules Recap

1. Never commit directly to `main` — always use your own branch.
2. Pull before you start working, every session.
3. Commit often with clear messages.
4. Never commit `.env` or `node_modules` — already excluded, don't force-add them.
5. Stay inside your assigned folder/files.
6. If stuck or unsure, ask before force-pushing or deleting anything.
