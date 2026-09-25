import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

type User = { id: string; email: string; name: string; passwordHash: string; createdAt: Date };
type Conversation = { id: string; userId: string; title: string; createdAt: Date; updatedAt: Date };
type Message = { id: string; conversationId: string; role: 'USER' | 'SYSTEM'; content: string; createdAt: Date };

@Injectable()
export class AppService {
  private users = new Map<string, User>(); private conversations = new Map<string, Conversation>(); private messageRecords = new Map<string, Message>();
  status() { return { name: 'EchoGPT API', status: 'ok', timestamp: new Date().toISOString() }; }
  async register(email: string, name: string, password: string) { email = email.trim().toLowerCase(); if ([...this.users.values()].some((u) => u.email === email)) throw new ConflictException('Email is already registered'); const u = { id: randomUUID(), email, name: name.trim(), passwordHash: await bcrypt.hash(password, 12), createdAt: new Date() }; this.users.set(u.id, u); return this.safe(u); }
  async login(email: string, password: string) { const u = [...this.users.values()].find((v) => v.email === email.trim().toLowerCase()); if (!u || !(await bcrypt.compare(password, u.passwordHash))) throw new UnauthorizedException('Invalid email or password'); return this.safe(u); }
  me(userId: string) { const u = this.users.get(userId); if (!u) throw new UnauthorizedException(); return this.safe(u); }
  list(userId: string) { return [...this.conversations.values()].filter((c) => c.userId === userId).sort((a,b) => b.updatedAt.getTime()-a.updatedAt.getTime()); }
  create(userId: string, title: string) { const now = new Date(); const c = { id: randomUUID(), userId, title: title.trim(), createdAt: now, updatedAt: now }; this.conversations.set(c.id,c); return c; }
  update(userId: string, id: string, title: string) { const c = this.owned(userId,id); c.title=title.trim(); c.updatedAt=new Date(); return c; }
  remove(userId: string, id: string) { this.owned(userId,id); this.conversations.delete(id); for (const [mid,m] of this.messageRecords) if (m.conversationId===id) this.messageRecords.delete(mid); }
  messages(userId: string, id: string) { this.owned(userId,id); return [...this.messageRecords.values()].filter((m)=>m.conversationId===id).sort((a,b)=>a.createdAt.getTime()-b.createdAt.getTime()); }
  message(userId: string,id: string,content:string,role:'USER'|'SYSTEM'='USER') { const c=this.owned(userId,id); const m={id:randomUUID(),conversationId:id,role,content:content.trim(),createdAt:new Date()}; this.messageRecords.set(m.id,m); c.updatedAt=new Date(); return m; }
  private owned(userId:string,id:string) { const c=this.conversations.get(id); if (!c || c.userId!==userId) throw new NotFoundException('Conversation not found'); return c; }
  private safe(u:User) { const {passwordHash,...safe}=u; return safe; }
}
