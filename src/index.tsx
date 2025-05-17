/* @refresh reload */
import './index.css';

import { render } from 'solid-js/web';
import { Route, Router } from '@solidjs/router';
import { RootLayout } from './layout';
import { Index } from "./pages/index";
import NotFound from './errors/404';
import { ChatLayout } from './pages/chat/layout';
import { ChatIndex } from './pages/chat';
import { Chat } from './pages/chat/[id]';
import { ChatNew } from './pages/chat/new';
import { LinkOnboarding } from './pages/c/[id]';

const darkMode = window.matchMedia("(prefers-color-scheme: dark)");
export let isDark = darkMode.matches;

document.body.setAttribute("data-theme", darkMode.matches ? "dark" : "light");
darkMode.addEventListener("change", ev => {
    document.body.setAttribute("data-theme", ev.matches ? "dark" : "light");
    isDark = ev.matches;
});

render(
    () => <Router root={RootLayout}>
        <Route path="/" component={Index} />
        <Route path="/chat" component={ChatLayout}>
            <Route path="/" component={ChatIndex} />
            <Route path="/new" component={ChatNew} />
            <Route path="/:id" component={Chat} />
        </Route>
        <Route path="/c/:id" component={LinkOnboarding} />
        <Route path="*" component={NotFound} />
    </Router>,
    document.getElementById("root"),
);
