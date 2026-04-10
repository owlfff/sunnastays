import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import './MessageThread.css';

const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = d => {
  const dt = new Date(d);
  return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getHours()}:${String(dt.getMinutes()).padStart(2,'0')}`;
};

export default function MessageThread({ bookingId, propertyId, currentUserId, currentUserName, senderType, otherName, threadId }) {
  const tid = threadId || bookingId;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Mark messages as read
    const readField = senderType === 'host' ? 'read_by_host' : 'read_by_guest';
    supabase.from('messages')
      .update({ [readField]: true })
      .eq('thread_id', tid)
      .eq(readField, false)
      .then(() => {});

    // Real-time subscription
    const channel = supabase
      .channel(`messages:${tid}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, payload => {
        if (payload.new.thread_id === tid) {
          setMessages(prev => [...prev, payload.new]);
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', tid)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    await supabase.from('messages').insert([{
      thread_id:    tid,
      booking_id:   bookingId || null,
      property_id:  propertyId,
      sender_id:    currentUserId,
      sender_name:  currentUserName,
      sender_type:  senderType,
      content:      newMessage.trim(),
    }]);

    setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="thread-wrap">
      <div className="thread-header">
        <div className="thread-avatar">{otherName?.[0] || '?'}</div>
        <div className="thread-other-name">{otherName}</div>
      </div>

      <div className="thread-messages">
        {messages.length === 0 && (
          <div className="thread-empty">No messages yet. Say hello!</div>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === currentUserId || m.sender_type === senderType;
          return (
            <div key={m.id} className={`thread-msg ${isMe ? 'thread-msg--me' : 'thread-msg--them'}`}>
              <div className="thread-bubble">{m.content}</div>
              <div className="thread-time">{fmt(m.created_at)}</div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="thread-input-wrap">
        <textarea
          className="thread-input"
          placeholder="Type a message…"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <button className="thread-send-btn" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
          {sending ? '…' : '→'}
        </button>
      </div>
    </div>
  );
}
