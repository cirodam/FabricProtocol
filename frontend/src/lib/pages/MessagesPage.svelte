<script lang="ts">
  const { navigate, memberId } = $props<{ navigate: (to: string) => void; memberId: string }>();

  type MessageDto = {
    id: string;
    sentAt: string;
    fromId: string;
    fromName: string;
    fromHandle: string | null;
    toId: string;
    toName: string;
    subject: string;
    body: string;
    readAt: string | null;
  };

  type Tab = 'inbox' | 'sent' | 'announcements';

  let tab: Tab = $state('inbox');
  let messages: MessageDto[] = $state([]);
  let selected: MessageDto | null = $state(null);
  let loading = $state(false);
  let error = $state('');

  async function loadMessages() {
    if (!memberId) return;
    loading = true;
    error = '';
    try {
      let url = '';
      if (tab === 'inbox')         url = `/api/messages/inbox?memberId=${memberId}`;
      else if (tab === 'sent')     url = `/api/messages/sent?memberId=${memberId}`;
      else                         url = `/api/messages/broadcasts`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      messages = await res.json();
      // If selected message is still in list, refresh it
      if (selected) {
        selected = messages.find(m => m.id === selected!.id) ?? null;
      }
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => { tab; void loadMessages(); });

  async function selectMessage(msg: MessageDto) {
    selected = msg;
    if (!msg.readAt && tab === 'inbox') {
      await fetch(`/api/messages/${msg.id}/read`, { method: 'POST' });
      msg.readAt = new Date().toISOString();
      messages = messages.map(m => m.id === msg.id ? { ...m, readAt: msg.readAt } : m);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/messages/${id}`, { method: 'DELETE' });
    if (selected?.id === id) selected = null;
    messages = messages.filter(m => m.id !== id);
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    return isToday
      ? d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
</script>

<div class="messages-page">
  <div class="page-header">
    <h1>Messages</h1>
    <button class="btn-primary" onclick={() => navigate('/messages/new')}>+ New Message</button>
  </div>

  {#if !memberId}
    <div class="member-picker">
      <p>Select a member to view their messages:</p>
      <select onchange={(e) => navigate('/messages?as=' + (e.target as HTMLSelectElement).value)}>
        <option value="">— select member —</option>
        {#each members as m}
          <option value={m.id}>{m.firstName} {m.lastName} (@{m.handle})</option>
        {/each}
      </select>
    </div>
  {:else}
    <div class="layout">
      <!-- ── Sidebar ── -->
      <div class="sidebar">
        <div class="tabs">
          <button class:active={tab === 'inbox'}         onclick={() => { tab = 'inbox';         selected = null; }}>Inbox</button>
          <button class:active={tab === 'sent'}          onclick={() => { tab = 'sent';          selected = null; }}>Sent</button>
          <button class:active={tab === 'announcements'} onclick={() => { tab = 'announcements'; selected = null; }}>Announcements</button>
        </div>

        {#if loading}
          <p class="empty">Loading…</p>
        {:else if error}
          <p class="error">{error}</p>
        {:else if messages.length === 0}
          <p class="empty">No messages.</p>
        {:else}
          <ul class="message-list">
            {#each messages as msg}
              <li>
                <button
                  class="message-row"
                  class:unread={!msg.readAt && tab === 'inbox'}
                  class:active={selected?.id === msg.id}
                  onclick={() => selectMessage(msg)}
                >
                  <span class="msg-from">
                    {tab === 'sent'
                      ? (msg.toId === 'broadcast' ? '📢 All members' : msg.toName)
                      : (msg.fromId === 'system' ? '⚙ System' : msg.fromName)}
                  </span>
                  <span class="msg-date">{formatDate(msg.sentAt)}</span>
                  <span class="msg-subject">{msg.subject}</span>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <!-- ── Message pane ── -->
      <div class="message-pane">
        {#if !selected}
          <div class="no-selection">Select a message to read it.</div>
        {:else}
          <div class="message-header">
            <h2>{selected.subject}</h2>
            <div class="message-meta">
              <span>From: <strong>{selected.fromId === 'system' ? 'System' : selected.fromName}</strong>{#if selected.fromHandle} (@{selected.fromHandle}){/if}</span>
              <span>To: <strong>{selected.toId === 'broadcast' ? '📢 All members' : selected.toName}</strong></span>
              <span>{new Date(selected.sentAt).toLocaleString()}</span>
            </div>
          </div>
          <div class="message-body">{selected.body}</div>
          <div class="message-actions">
            {#if tab === 'inbox' && selected.fromId !== 'system'}
              <button
                class="btn-secondary"
                onclick={() => navigate(`/messages/new?replyTo=${selected!.fromId}&subject=${encodeURIComponent('Re: ' + selected!.subject)}`)}
              >Reply</button>
            {/if}
            <button class="btn-danger" onclick={() => deleteMessage(selected!.id)}>Delete</button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .messages-page { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
  h1 { margin: 0; font-size: 1.5rem; }

  .layout { display: grid; grid-template-columns: 300px 1fr; gap: 0; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; min-height: 520px; }
  @media (max-width: 750px) { .layout { grid-template-columns: 1fr; } }

  /* Sidebar */
  .sidebar { border-right: 1px solid #ddd; display: flex; flex-direction: column; background: #fafafa; }
  .tabs { display: flex; border-bottom: 1px solid #ddd; }
  .tabs button { flex: 1; padding: 0.6rem 0.3rem; font-size: 0.78rem; border: none; background: none; cursor: pointer; color: #555; border-bottom: 2px solid transparent; }
  .tabs button.active { color: #1a6db5; border-bottom-color: #1a6db5; font-weight: 600; }

  .message-list { list-style: none; padding: 0; margin: 0; overflow-y: auto; flex: 1; }
  .message-row { display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto; gap: 1px 0.5rem; width: 100%; text-align: left; background: none; border: none; border-bottom: 1px solid #eee; padding: 0.65rem 0.75rem; cursor: pointer; }
  .message-row:hover { background: #f0f4ff; }
  .message-row.active { background: #e8f0fb; }
  .message-row.unread .msg-from,
  .message-row.unread .msg-subject { font-weight: 700; }

  .msg-from  { font-size: 0.85rem; color: #222; grid-column: 1; }
  .msg-date  { font-size: 0.75rem; color: #888; grid-column: 2; white-space: nowrap; }
  .msg-subject { font-size: 0.78rem; color: #555; grid-column: 1 / -1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Message pane */
  .message-pane { display: flex; flex-direction: column; padding: 1.25rem; }
  .no-selection { color: #aaa; margin: auto; font-size: 0.9rem; }
  .message-header { padding-bottom: 0.75rem; border-bottom: 1px solid #eee; margin-bottom: 0.75rem; }
  .message-header h2 { margin: 0 0 0.4rem; font-size: 1.1rem; }
  .message-meta { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; font-size: 0.8rem; color: #666; }
  .message-body { flex: 1; white-space: pre-wrap; font-size: 0.92rem; line-height: 1.6; color: #333; margin-bottom: 1rem; }
  .message-actions { display: flex; gap: 0.5rem; }

  .member-picker { padding: 2rem; color: #555; }
  .member-picker p { margin-bottom: 0.75rem; }
  .member-picker select { padding: 0.45rem 0.6rem; border: 1px solid #ccc; border-radius: 5px; font-size: 0.9rem; min-width: 260px; }
  .empty { text-align: center; color: #aaa; padding: 2rem; font-size: 0.85rem; }
  .error { color: #c0392b; padding: 0.75rem; background: #fdf0f0; border-radius: 4px; font-size: 0.85rem; }

  .btn-primary   { padding: 0.5rem 1rem; background: #1a6db5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-primary:hover { background: #155a96; }
  .btn-secondary { padding: 0.4rem 0.8rem; background: white; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  .btn-danger    { padding: 0.4rem 0.8rem; background: #c0392b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  .btn-danger:hover { background: #a93226; }
</style>
