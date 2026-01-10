
import React, { useState, useEffect, FC } from 'react';
import { Course, Session, AcademyPathId, QuizQuestion, Challenge, User, HeyFam, Submission, ResourceLink } from '../types';
import { 
    ArrowLeft, Loader2, PlusCircle, Edit, Trash2, X, 
    Youtube, BookOpen, MessageSquare, Award, Users, 
    HelpCircle, ChevronDown, AlignLeft, Book, Plus,
    CheckCircle, Shield, UserCheck, Search, Filter,
    Trash, Save, ExternalLink, MessageCircle, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as firebaseService from '../services/firebaseService';
import { useAuth } from '../App';
import { PATHS } from '../constants/academyPaths';

const getYouTubeId = (url: string) => {
    if (!url) return '';
    const cleanUrl = url.trim();
    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) return cleanUrl;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|live\/)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    if (match && match[2].length >= 11) return match[2].substring(0, 11);
    return cleanUrl;
};

// --- BIBLE VERSE EDITOR ---
const BibleVerseEditor: FC<{ verses: {reference: string, text: string}[], onChange: (v: any[]) => void }> = ({ verses, onChange }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                <Book size={12} className="mr-1.5 text-hey-church-yellow"/> Bible Verses (Study Tab)
            </h4>
            <button onClick={() => onChange([...(verses || []), { reference: '', text: '' }])} className="text-[10px] text-hey-church-yellow font-black flex items-center uppercase tracking-widest">
                <Plus size={12} className="mr-1"/> Add Verse
            </button>
        </div>
        {(verses || []).map((v, i) => (
            <div key={i} className="bg-gray-900/40 p-4 rounded-2xl border border-white/5 space-y-3 relative group animate-in slide-in-from-left-2">
                <button onClick={() => onChange(verses.filter((_, idx) => idx !== i))} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors">
                    <X size={16}/>
                </button>
                <div className="pr-10">
                    <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Reference</label>
                    <input 
                        placeholder="e.g. John 3:16" 
                        value={v.reference} 
                        onChange={e => { const newV = [...verses]; newV[i].reference = e.target.value; onChange(newV); }}
                        className="bg-transparent border-b border-gray-700 text-sm font-black text-hey-church-orange-400 outline-none w-full pb-1"
                    />
                </div>
                <div>
                    <label className="text-[9px] font-black text-gray-600 uppercase mb-1 block">Full Scripture Text</label>
                    <textarea 
                        placeholder="Paste the verse content here..." 
                        value={v.text}
                        onChange={e => { const newV = [...verses]; newV[i].text = e.target.value; onChange(newV); }}
                        className="w-full bg-gray-900/50 p-3 rounded-lg text-xs text-gray-300 outline-none h-20 resize-none italic leading-relaxed"
                    />
                </div>
            </div>
        ))}
    </div>
);

// --- QUIZ EDITOR WITH MULTI-SELECT VALIDATION ---
const QuizEditor: FC<{ questions: QuizQuestion[]; onChange: (q: QuizQuestion[]) => void }> = ({ questions, onChange }) => {
    const addQuestion = () => {
        onChange([...(questions || []), { id: `q_${Date.now()}_${questions?.length || 0}`, question: '', options: ['', '', '', ''], correctAnswerIndices: [], explanation: '' }]);
    };
    const updateQ = (idx: number, field: keyof QuizQuestion, val: any) => {
        const newQs = [...questions];
        (newQs[idx] as any)[field] = val;
        onChange(newQs);
    };

    const toggleCorrectIndex = (qIdx: number, oIdx: number) => {
        const currentIndices = questions[qIdx].correctAnswerIndices || [];
        let newIndices;
        if (currentIndices.includes(oIdx)) {
            newIndices = currentIndices.filter(i => i !== oIdx);
        } else {
            newIndices = [...currentIndices, oIdx];
        }
        updateQ(qIdx, 'correctAnswerIndices', newIndices);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center">
                    <HelpCircle size={12} className="mr-1.5 text-hey-church-blue"/> Knowledge Check (Mark one OR more correct answers)
                </h4>
                <button onClick={addQuestion} className="text-[10px] bg-hey-church-blue/20 text-hey-church-blue px-3 py-1.5 rounded-full flex items-center font-black uppercase tracking-widest">
                    <Plus size={12} className="mr-1" /> Add Question
                </button>
            </div>
            {(questions || []).map((q, qIdx) => (
                <div key={q.id} className="bg-gray-900/40 p-5 rounded-2xl border border-white/5 space-y-4 relative group">
                    <button onClick={() => onChange(questions.filter((_, i) => i !== qIdx))} className="absolute top-4 right-4 text-gray-600 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                    </button>
                    <div>
                        <label className="text-[9px] font-black text-gray-600 uppercase mb-1 ml-1 block">Question Title</label>
                        <input placeholder="Type question here..." value={q.question} onChange={e => updateQ(qIdx, 'question', e.target.value)} className="w-full bg-gray-900 p-3 rounded-xl text-sm font-bold text-white border border-gray-800 focus:border-hey-church-blue outline-none transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-600 uppercase mb-1 ml-1 block">Options & Multi-Validation (Check ALL that apply)</label>
                        {q.options.map((opt, oIdx) => {
                            const isCorrect = q.correctAnswerIndices?.includes(oIdx);
                            return (
                                <div key={oIdx} className={`flex items-center gap-3 p-2 rounded-xl transition-all ${isCorrect ? 'bg-hey-church-green/10 border border-hey-church-green/30' : ''}`}>
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            checked={isCorrect} 
                                            onChange={() => toggleCorrectIndex(qIdx, oIdx)} 
                                            className="w-6 h-6 opacity-0 absolute inset-0 z-10 cursor-pointer"
                                        />
                                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCorrect ? 'bg-hey-church-green border-hey-church-green' : 'border-gray-700'}`}>
                                            {isCorrect && <CheckCircle size={14} className="text-white"/>}
                                        </div>
                                    </div>
                                    <input 
                                        placeholder={`Option ${oIdx + 1}`} 
                                        value={opt} 
                                        onChange={e => { const newOpts = [...q.options]; newOpts[oIdx] = e.target.value; updateQ(qIdx, 'options', newOpts); }} 
                                        className={`flex-grow bg-gray-900/60 p-2.5 rounded-lg text-xs border-2 transition-all ${isCorrect ? 'border-hey-church-green/50 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'border-gray-800 text-gray-400'}`} 
                                    />
                                    {isCorrect && <span className="text-[8px] font-black text-hey-church-green uppercase tracking-tighter">Correct</span>}
                                </div>
                            );
                        })}
                    </div>
                    <div>
                         <label className="text-[9px] font-black text-gray-600 uppercase mb-1 ml-1 block">Hint if wrong (Optional)</label>
                         <input placeholder="Help them find the right answer..." value={q.explanation} onChange={e => updateQ(qIdx, 'explanation', e.target.value)} className="w-full bg-gray-900 p-2.5 rounded-lg text-[10px] text-hey-church-orange-400 border border-gray-800 italic" />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ListEditor: FC<{ items: string[], onChange: (items: string[]) => void, label: string, placeholder: string }> = ({ items, onChange, label, placeholder }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</label>
            <button onClick={() => onChange([...items, ''])} className="text-[10px] text-hey-church-blue font-black flex items-center uppercase tracking-widest">
                <Plus size={12} className="mr-1"/> Add Item
            </button>
        </div>
        {(items || []).map((item, i) => (
            <div key={i} className="flex gap-2 animate-in slide-in-from-left-1">
                <input 
                    value={item} 
                    onChange={e => { const newItems = [...items]; newItems[i] = e.target.value; onChange(newItems); }}
                    placeholder={placeholder}
                    className="flex-grow bg-gray-900 p-3 rounded-xl text-sm text-white border border-gray-800 outline-none focus:border-hey-church-blue"
                />
                <button onClick={() => onChange(items.filter((_, idx) => idx !== i))} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
            </div>
        ))}
    </div>
);

// --- MODAL EDITORS ---
const CourseEditor: FC<{ course: Course | null, onSave: (c: Course) => void, onClose: () => void }> = ({ course, onSave, onClose }) => {
    const [form, setForm] = useState<Course>(course || { id: `course_${Date.now()}`, title: '', description: '', pathId: 'foundation', thumbnail: '', order: 1, isPublished: true, sessions: [] } as Course);
    const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);
    const updateSession = (idx: number, field: string, value: any) => {
        const newSessions = [...form.sessions];
        (newSessions[idx] as any)[field] = value;
        setForm({ ...form, sessions: newSessions });
    };
    return (
        <div className="fixed inset-0 bg-black/90 z-[50] flex flex-col overflow-hidden font-sans">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shadow-xl relative z-10">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{course ? 'Edit Course' : 'New Course'}</h2>
                <div className="flex gap-3"><button onClick={onClose} className="px-5 py-2 text-gray-400 font-black uppercase text-xs">Cancel</button><button onClick={() => onSave(form)} className="px-8 py-2.5 bg-hey-church-green text-white rounded-xl font-black uppercase text-xs shadow-lg">Save Course</button></div>
            </div>
            <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-[#133666]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-800/40 p-8 rounded-[2.5rem] border border-white/5">
                    <div className="md:col-span-2 space-y-5">
                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">Course Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-black text-xl italic shadow-inner outline-none focus:border-hey-church-blue"/></div>
                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">Short Pitch</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white text-sm h-24 outline-none focus:border-hey-church-blue"/></div>
                    </div>
                    <div className="space-y-5">
                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">Learning Path</label><select value={form.pathId} onChange={e => setForm({...form, pathId: e.target.value as AcademyPathId})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white font-bold outline-none focus:border-hey-church-blue">{PATHS.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">Cover Image URL</label><input value={form.thumbnail} onChange={e => setForm({...form, thumbnail: e.target.value})} className="w-full p-4 bg-gray-900 border border-gray-700 rounded-2xl text-white text-xs font-mono"/></div>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-end px-2"><h3 className="text-2xl font-black text-white uppercase italic leading-none">Curriculum</h3><button onClick={() => setForm({...form, sessions: [...(form.sessions || []), { id: `s_${Date.now()}`, title: '', videoId: '', reflectionQuestions: [], bibleVerses: [], keyTakeaways: [] } as Session]}) } className="bg-hey-church-blue px-6 py-2.5 rounded-xl text-xs font-black uppercase flex items-center shadow-lg"><PlusCircle className="mr-2" size={16}/> Add Session</button></div>
                    <div className="space-y-4">{(form.sessions || []).map((session, idx) => (
                        <div key={idx} className="bg-gray-800 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl">
                            <div className="p-5 bg-gray-750 flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors" onClick={() => setEditingSessionIdx(editingSessionIdx === idx ? null : idx)}>
                                <div className="flex items-center gap-4"><span className="bg-gray-900 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black text-hey-church-orange-400 border border-white/5">{idx + 1}</span><span className="font-black text-white uppercase tracking-tight italic">{session.title || 'Untitled Session'}</span></div>
                                <div className="flex items-center gap-4"><span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{editingSessionIdx === idx ? 'Close' : 'Edit Content'}</span><ChevronDown size={20} className={`text-gray-500 transition-transform ${editingSessionIdx === idx ? 'rotate-180' : ''}`}/></div>
                            </div>
                            {editingSessionIdx === idx && (
                                <div className="p-8 space-y-10 bg-gray-800/80 border-t border-white/5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">Session Title</label><input value={session.title} onChange={e => updateSession(idx, 'title', e.target.value)} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white font-bold shadow-inner outline-none"/></div>
                                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2 block">YouTube Video URL / ID</label><input value={session.videoId} onChange={e => updateSession(idx, 'videoId', getYouTubeId(e.target.value))} className="w-full p-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm shadow-inner outline-none"/></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <ListEditor label="Key Takeaways" items={session.keyTakeaways || []} onChange={items => updateSession(idx, 'keyTakeaways', items)} placeholder="Enter a key point..." />
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center"><AlignLeft size={12} className="mr-1.5 text-hey-church-blue"/> Case Study Scenario</label>
                                            <div className="space-y-3 bg-gray-900/50 p-6 rounded-3xl border border-white/5 shadow-inner">
                                                <textarea placeholder="The Story Context..." value={session.caseStudy?.scenario || ''} onChange={e => updateSession(idx, 'caseStudy', { ...session.caseStudy, scenario: e.target.value })} className="w-full bg-transparent text-sm text-gray-300 outline-none h-24 resize-none italic"/>
                                                <div className="h-px bg-white/5 w-full my-2"></div>
                                                <input placeholder="The Final Question for the user" value={session.caseStudy?.question || ''} onChange={e => updateSession(idx, 'caseStudy', { ...session.caseStudy, question: e.target.value })} className="w-full bg-transparent text-sm font-black text-white outline-none uppercase tracking-tight"/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <BibleVerseEditor verses={session.bibleVerses || []} onChange={v => updateSession(idx, 'bibleVerses', v)} />
                                        <ListEditor label="Reflection Questions" items={session.reflectionQuestions || []} onChange={q => updateSession(idx, 'reflectionQuestions', q)} placeholder="Enter an open question..." />
                                    </div>
                                    <QuizEditor questions={session.quizQuestions || []} onChange={qs => updateSession(idx, 'quizQuestions', qs)} />
                                    <div className="pt-6 border-t border-red-900/20 flex justify-end"><button onClick={() => { if(confirm('Permanently delete this session?')) setForm({...form, sessions: form.sessions.filter((_, i) => i !== idx)}); }} className="text-red-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all"><Trash2 size={14} className="mr-2"/> Remove Session</button></div>
                                </div>
                            )}
                        </div>
                    ))}</div>
                </div>
            </div>
        </div>
    );
};

const ChallengeEditor: FC<{ challenge: Challenge | null, onSave: (c: Challenge) => void, onClose: () => void }> = ({ challenge, onSave, onClose }) => {
    const [form, setForm] = useState<Challenge>(challenge || { id: `so_${Date.now()}`, title: '', description: '', why: '', category: 'Spiritual Habits', duration: 7, points: 100 } as Challenge);
    return (
        <div className="fixed inset-0 bg-black/90 z-[50] flex flex-col overflow-hidden font-sans">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shadow-xl">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{challenge ? 'Edit Challenge' : 'New Challenge'}</h2>
                <div className="flex gap-3"><button onClick={onClose} className="px-5 py-2 text-gray-400 font-black uppercase text-xs">Cancel</button><button onClick={() => onSave(form)} className="px-8 py-2.5 bg-hey-church-red text-white rounded-xl font-black uppercase text-xs shadow-lg">Save Challenge</button></div>
            </div>
            <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-gray-900">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Title</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white font-bold"/></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm h-24"/></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">The "Why" (Motivation)</label><textarea value={form.why} onChange={e => setForm({...form, why: e.target.value})} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm h-24 italic"/></div>
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Duration (Days)</label><input type="number" value={form.duration} onChange={e => setForm({...form, duration: parseInt(e.target.value)})} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white font-bold"/></div>
                        <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Reward Points</label><input type="number" value={form.points} onChange={e => setForm({...form, points: parseInt(e.target.value)})} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white font-bold text-hey-church-yellow"/></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HeyFamEditor: FC<{ fam: HeyFam | null, onSave: (f: HeyFam) => void, onClose: () => void }> = ({ fam, onSave, onClose }) => {
    const [form, setForm] = useState<HeyFam>(fam || { id: `fam_${Date.now()}`, name: '', description: '', avatar: 'https://ui-avatars.com/api/?name=New+Fam&background=random', leaderId: '', memberIds: [], messages: [], resources: [] } as HeyFam);
    return (
        <div className="fixed inset-0 bg-black/90 z-[50] flex flex-col overflow-hidden font-sans">
            <div className="bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center shadow-xl">
                <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{fam ? 'Edit Hey Fam' : 'New Hey Fam'}</h2>
                <div className="flex gap-3"><button onClick={onClose} className="px-5 py-2 text-gray-400 font-black uppercase text-xs">Cancel</button><button onClick={() => onSave(form)} className="px-8 py-2.5 bg-hey-church-blue text-white rounded-xl font-black uppercase text-xs shadow-lg">Save Group</button></div>
            </div>
            <div className="flex-grow overflow-y-auto p-8 space-y-6 bg-gray-900">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="flex items-center gap-6 mb-6">
                        <img src={form.avatar} className="w-24 h-24 rounded-full border-4 border-hey-church-blue object-cover shadow-2xl" />
                        <div className="flex-grow">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 block">Avatar URL</label>
                            <input value={form.avatar} onChange={e => setForm({...form, avatar: e.target.value})} className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-xs font-mono" />
                        </div>
                    </div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Group Name</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white font-bold"/></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Description</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm h-32 leading-relaxed"/></div>
                    <div className="grid grid-cols-2 gap-6">
                         <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Meeting Time</label><input value={form.meetingTime || ''} onChange={e => setForm({...form, meetingTime: e.target.value})} placeholder="e.g. Tuesdays 7:00 PM" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm"/></div>
                         <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Meeting Location</label><input value={form.meetingLocation || ''} onChange={e => setForm({...form, meetingLocation: e.target.value})} placeholder="e.g. Community Hall" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-sm"/></div>
                    </div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 block">Leader UID</label><input value={form.leaderId} onChange={e => setForm({...form, leaderId: e.target.value})} placeholder="Paste user ID here" className="w-full p-4 bg-gray-800 border border-gray-700 rounded-2xl text-white text-xs font-mono"/></div>
                </div>
            </div>
        </div>
    );
};

const AdminPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'academy' | 'challenges' | 'fams' | 'submissions' | 'users'>('academy');
    
    // Data States
    const [courses, setCourses] = useState<Course[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [fams, setFams] = useState<HeyFam[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    
    // Edit States
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
    const [editingFam, setEditingFam] = useState<HeyFam | null>(null);
    const [isCreatingCourse, setIsCreatingCourse] = useState(false);
    const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);
    const [isCreatingFam, setIsCreatingFam] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => { 
        setLoading(true);
        if (activeTab === 'academy') firebaseService.getCourses().then(c => { setCourses(c); setLoading(false); }).catch(() => setLoading(false)); 
        if (activeTab === 'challenges') firebaseService.getChallenges().then(c => { setChallenges(c); setLoading(false); }).catch(() => setLoading(false));
        if (activeTab === 'fams') firebaseService.getHeyFams().then(f => { setFams(f); setLoading(false); }).catch(() => setLoading(false));
        if (activeTab === 'users') firebaseService.getAllUsers().then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
        if (activeTab === 'submissions') firebaseService.getSubmissions().then(s => { setSubmissions(s); setLoading(false); }).catch(() => setLoading(false));
    }, [activeTab]);

    if (!user || user.role !== 'admin') return <div className="p-8 text-white text-center font-sans"><Shield size={64} className="mx-auto text-hey-church-red mb-6" /><h1 className="text-3xl font-black uppercase">Access Restricted</h1><p className="text-gray-400 mt-2">Only system administrators can view this terminal.</p><button onClick={() => navigate('/home')} className="mt-8 bg-white text-black px-8 py-3 rounded-full font-bold">Return Home</button></div>;

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleRoleChange = async (uid: string, newRole: 'user' | 'leader' | 'admin') => {
        if (!confirm(`Update user role to ${newRole}?`)) return;
        await firebaseService.updateUserData(uid, { role: newRole });
        firebaseService.getAllUsers().then(setUsers);
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm("Are you sure you want to permanently delete this user document? This action is irreversible.")) return;
        try {
            await firebaseService.deleteUserDocument(uid);
            alert("User document deleted.");
            firebaseService.getAllUsers().then(setUsers);
        } catch (e) {
            console.error(e);
            alert("Failed to delete user document.");
        }
    };

    const sidebarItems = [
        { id: 'academy', label: 'Academy', icon: BookOpen },
        { id: 'challenges', label: 'Challenges', icon: Award },
        { id: 'fams', label: 'Hey Fams', icon: Users },
        { id: 'submissions', label: 'Answers', icon: MessageSquare },
        { id: 'users', label: 'User Directory', icon: UserCheck }
    ];

    return (
        <div className="bg-hey-church-bg min-h-screen text-white flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <div className="md:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0">
                <div className="p-6 border-b border-gray-800"><h1 className="text-xl font-black uppercase tracking-widest italic">Admin Panel</h1></div>
                <nav className="p-4 space-y-2">
                    <button onClick={() => navigate('/home')} className="w-full flex items-center p-3 text-gray-500 hover:text-white hover:bg-gray-800 rounded-2xl transition-all mb-4 font-black text-xs uppercase tracking-widest"><ArrowLeft size={16} className="mr-3"/> Back to App</button>
                    {sidebarItems.map(item => {
                        const IconComponent = item.icon;
                        const active = activeTab === item.id;
                        return (
                            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center p-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${active ? 'bg-hey-church-blue text-white shadow-xl shadow-hey-church-blue/10' : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'}`}>
                                <IconComponent size={18} className="mr-3"/> {item.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-grow p-6 md:p-10 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    
                    {/* ACADEMY TAB */}
                    {activeTab === 'academy' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex justify-between items-end mb-8"><h2 className="text-4xl font-black uppercase tracking-tighter italic">Courses</h2><button onClick={() => setIsCreatingCourse(true)} className="bg-hey-church-green px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-2xl hover:scale-105 transition-all"><PlusCircle className="mr-2" size={18}/> New Course</button></div>
                            {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto mb-4" size={40}/><p className="text-xs uppercase font-black tracking-widest text-gray-600">Loading Academy Data...</p></div> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(courses || []).map(course => (
                                        <div key={course.id} className="bg-gray-800 rounded-[2.5rem] p-6 border border-white/5 shadow-2xl hover:border-hey-church-blue/50 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-hey-church-blue/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none group-hover:bg-hey-church-blue/10"></div>
                                            <div className="flex justify-between items-start mb-4 relative z-10">
                                                <span className="text-[8px] px-3 py-1.5 rounded-full bg-gray-900 text-gray-400 uppercase font-black tracking-[0.2em] border border-white/5">{course.pathId?.replace('_', ' ')}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingCourse(course)} className="p-2.5 bg-blue-900/30 text-blue-400 rounded-xl hover:bg-blue-900/50 transition-colors border border-blue-900/20"><Edit size={16}/></button>
                                                    <button onClick={async () => { if(confirm('Delete?')) { await firebaseService.deleteCourse(course.id); firebaseService.getCourses().then(setCourses); } }} className="p-2.5 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/50 transition-colors border border-red-900/20"><Trash size={16}/></button>
                                                </div>
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="font-black text-xl mb-1 leading-tight text-white uppercase tracking-tight line-clamp-2 italic">{course.title}</h3>
                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">{course.sessions?.length || 0} sessions</p>
                                            </div>
                                        </div>
                                    ))}
                                    {courses.length === 0 && <p className="text-center col-span-full py-10 text-gray-600 uppercase font-black text-xs">No courses found.</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* CHALLENGES TAB */}
                    {activeTab === 'challenges' && (
                        <div className="animate-in fade-in duration-500">
                            <div className="flex justify-between items-end mb-8"><h2 className="text-4xl font-black uppercase tracking-tighter italic">Challenges</h2><button onClick={() => setIsCreatingChallenge(true)} className="bg-hey-church-red px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-2xl hover:scale-105 transition-all"><PlusCircle className="mr-2" size={18}/> New Challenge</button></div>
                            {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto mb-4" size={40}/><p className="text-xs uppercase font-black tracking-widest text-gray-600">Loading Challenges...</p></div> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {(challenges || []).map(challenge => (
                                        <div key={challenge.id} className="bg-gray-800 rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative flex flex-col justify-between min-h-[160px]">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-[8px] px-3 py-1.5 rounded-full bg-hey-church-orange-900 text-hey-church-orange-400 uppercase font-black tracking-widest">{challenge.category}</span>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setEditingChallenge(challenge)} className="p-2.5 bg-blue-900/30 text-blue-400 rounded-xl hover:bg-blue-900/50"><Edit size={16}/></button>
                                                    <button onClick={async () => { if(confirm('Delete?')) { await firebaseService.deleteChallenge(challenge.id); firebaseService.getChallenges().then(setChallenges); } }} className="p-2.5 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/50"><Trash size={16}/></button>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-black text-xl mb-1 leading-tight text-white uppercase italic">{challenge.title}</h3>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{challenge.duration} Days</p>
                                                    <p className="text-[10px] text-hey-church-yellow font-black uppercase tracking-widest">{challenge.points} Points Reward</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {challenges.length === 0 && <p className="text-center col-span-full py-10 text-gray-600 uppercase font-black text-xs">No active challenges found.</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* FAMS TAB - RESTORED & ENHANCED */}
                    {activeTab === 'fams' && (
                        <div className="animate-in fade-in duration-500">
                             <div className="flex justify-between items-end mb-8">
                                 <div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Hey Fams</h2>
                                    <p className="text-gray-500 text-xs mt-2 uppercase font-bold tracking-widest">Community Groups Oversight</p>
                                 </div>
                                 <button onClick={() => setIsCreatingFam(true)} className="bg-hey-church-blue px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-2xl hover:scale-105 transition-all"><PlusCircle className="mr-2" size={18}/> New Fam</button>
                             </div>
                             {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto mb-4" size={40}/><p className="text-xs uppercase font-black tracking-widest text-gray-600">Syncing Hey Fams Directory...</p></div> : (
                                <div className="space-y-4">
                                    {fams.length > 0 ? fams.map(fam => (
                                        <div key={fam.id} className="bg-gray-800 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between shadow-xl group hover:border-hey-church-blue/30 transition-all">
                                            <div className="flex items-center gap-6">
                                                <img src={fam.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-hey-church-blue" />
                                                <div>
                                                    <h3 className="text-xl font-black text-white uppercase italic">{fam.name}</h3>
                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">
                                                        {fam.memberIds?.length || 0} Members • Leader ID: {fam.leaderId ? `${fam.leaderId.slice(0,8)}...` : 'Unassigned'}
                                                    </p>
                                                    <div className="flex gap-3 mt-2">
                                                        <span className="flex items-center text-[9px] text-gray-400 font-bold uppercase"><MessageCircle size={10} className="mr-1"/> {fam.messages?.length || 0} Chats</span>
                                                        <span className="flex items-center text-[9px] text-gray-400 font-bold uppercase"><BookOpen size={10} className="mr-1"/> {fam.resources?.length || 0} Files</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={() => setEditingFam(fam)} className="bg-blue-900/30 text-blue-400 p-3 rounded-xl hover:bg-blue-900/50 border border-blue-900/20"><Edit size={18}/></button>
                                                <button onClick={() => navigate(`/community/fam/${fam.id}`)} className="bg-gray-700/50 p-3 rounded-xl hover:bg-gray-700"><ExternalLink size={18}/></button>
                                                <button onClick={async () => { if(confirm('Delete this group forever?')) { await firebaseService.deleteHeyFam(fam.id); firebaseService.getHeyFams().then(setFams); } }} className="bg-red-900/30 text-red-400 p-3 rounded-xl hover:bg-red-900/50 border border-red-900/20"><Trash2 size={18}/></button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-20 bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-700">
                                            <Users size={48} className="mx-auto text-gray-700 mb-4" />
                                            <p className="text-gray-500 font-black uppercase tracking-widest text-sm">No groups found in database.</p>
                                        </div>
                                    )}
                                </div>
                             )}
                        </div>
                    )}

                    {/* USER DIRECTORY TAB */}
                    {activeTab === 'users' && (
                        <div className="animate-in fade-in duration-500">
                             <div className="flex justify-between items-end mb-8">
                                <div><h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">User Directory</h2><p className="text-gray-500 text-xs mt-2 uppercase font-bold tracking-widest">{users.length} Registered Members</p></div>
                                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/><input placeholder="Search name or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-2xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-hey-church-blue outline-none w-64"/></div>
                             </div>
                             
                             <div className="bg-gray-800 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-900/50 border-b border-white/5 text-[10px] font-black uppercase text-gray-500 tracking-widest">
                                        <tr>
                                            <th className="p-6">Member</th>
                                            <th className="p-6">Current Role</th>
                                            <th className="p-6">Points</th>
                                            <th className="p-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredUsers.map(u => (
                                            <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="p-6">
                                                    <div className="flex items-center gap-4">
                                                        <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10" />
                                                        <div><p className="font-black text-white uppercase italic text-sm">{u.name}</p><p className="text-[10px] text-gray-500 font-bold">{u.email}</p></div>
                                                    </div>
                                                </td>
                                                <td className="p-6"><span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'bg-hey-church-red/20 text-hey-church-red' : u.role === 'leader' ? 'bg-hey-church-blue/20 text-hey-church-blue' : 'bg-gray-700 text-gray-300'}`}>{u.role}</span></td>
                                                <td className="p-6 text-hey-church-yellow font-black tabular-nums">{u.points.toLocaleString()}</td>
                                                <td className="p-6 text-right space-x-2">
                                                    <button onClick={() => handleDeleteUser(u.id)} className="p-2.5 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/50 transition-colors border border-red-900/20" title="Permanently Delete User"><Trash size={16}/></button>
                                                    <button onClick={() => handleRoleChange(u.id, 'user')} className="text-[8px] font-black uppercase text-gray-500 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg">Demote</button>
                                                    <button onClick={() => handleRoleChange(u.id, 'leader')} className="text-[8px] font-black uppercase text-hey-church-blue border border-hey-church-blue/30 px-3 py-1.5 rounded-lg hover:bg-hey-church-blue/10">Make Leader</button>
                                                    <button onClick={() => handleRoleChange(u.id, 'admin')} className="text-[8px] font-black uppercase text-hey-church-red border border-hey-church-red/30 px-3 py-1.5 rounded-lg hover:bg-hey-church-red/10">Make Admin</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    )}

                    {activeTab === 'submissions' && (
                         <div className="animate-in fade-in duration-500 text-center py-40">
                             <MessageSquare className="mx-auto text-gray-700 mb-4" size={48} />
                             <h2 className="text-2xl font-black uppercase">Submission Review</h2>
                             <p className="text-gray-500 mt-2">Feature scaling for high traffic. {submissions.length} total answers stored.</p>
                         </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {(editingCourse || isCreatingCourse) && (
                <CourseEditor course={editingCourse} onSave={async (c) => { if (isCreatingCourse) await firebaseService.addCourse(c); else await firebaseService.updateCourse(c.id, c); setIsCreatingCourse(false); setEditingCourse(null); firebaseService.getCourses().then(setCourses); }} onClose={() => { setEditingCourse(null); setIsCreatingCourse(false); }} />
            )}
            {(editingChallenge || isCreatingChallenge) && (
                <ChallengeEditor challenge={editingChallenge} onSave={async (c) => { if (isCreatingChallenge) await firebaseService.addChallenge(c); else await firebaseService.updateChallenge(c.id, c); setIsCreatingChallenge(false); setEditingChallenge(null); firebaseService.getChallenges().then(setChallenges); }} onClose={() => { setEditingChallenge(null); setIsCreatingChallenge(false); }} />
            )}
            {(editingFam || isCreatingFam) && (
                <HeyFamEditor fam={editingFam} onSave={async (f) => { if (isCreatingFam) await firebaseService.createHeyFam(f); else await firebaseService.updateHeyFam(f.id, f); setIsCreatingFam(false); setEditingFam(null); firebaseService.getHeyFams().then(setFams); }} onClose={() => { setEditingFam(null); setIsCreatingFam(false); }} />
            )}
        </div>
    );
};

export default AdminPage;
