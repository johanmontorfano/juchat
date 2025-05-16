/* @refresh reload */
// import './index.css';

import { render } from 'solid-js/web';
import { Route, Router } from '@solidjs/router';
import { RootLayout } from './layout';
import { Index } from "./pages/index";
import NotFound from './errors/404';
import { ChatLayout } from './pages/chat/layout';
import { ChatIndex } from './pages/chat';
import { Chat } from './pages/chat/[id]';
import { ChatNew } from './pages/chat/new';

render(
    () => <Router root={RootLayout}>
        <Route path="/" component={Index} />
        <Route path="/chat" component={ChatLayout}>
            <Route path="/" component={ChatIndex} />
            <Route path="/new" component={ChatNew} />
            <Route path="/:id" component={Chat} />
        </Route>
        <Route path="*" component={NotFound} />
    </Router>,
    document.getElementById("root"),
);
