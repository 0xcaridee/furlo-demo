import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Bot,
  Send,
  CircleAlert as AlertCircle,
  Stethoscope,
  Clock,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  BookOpen,
  Sparkles,
  ListChecks,
  MessageSquareHeart,
  Check,
  NotebookPen,
} from 'lucide-react-native';
import { StorageService } from '@/utils/storage';
import { PET_PHOTOS, profileSummary } from '@/lib/pet';
import {
  STEPS,
  Answers,
  Urgency,
  URGENCY_META,
  RED_FLAG_RULE_COUNT,
  decideUrgency,
  retrievePassages,
  buildAdvice,
  triggeredFlags,
  Passage,
  Advice,
} from '@/lib/triage';

type Result = {
  urgency: Urgency;
  passages: Passage[];
  advice: Advice;
  answers: Answers;
  redCount: number;
};

type Message =
  | { id: string; sender: 'user' | 'ai'; kind: 'text'; text: string }
  | { id: string; sender: 'ai'; kind: 'result'; result: Result };

type Phase = 'start' | 'triage' | 'done';

let idCounter = 0;


const nextId = () => `m${++idCounter}`;

export default function CompawnionScreen() {
  const [pet, setPet] = useState('Teakha');
  const [profile, setProfile] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<Phase>('start');
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [multiPick, setMultiPick] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [saved, setSaved] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const startChips = [
    `${pet} vomited this morning`,
    `${pet} has diarrhoea`,
    `Can ${pet} eat mango?`,
  ];

  useEffect(() => {
    StorageService.getPetProfile().then((p) => {
      if (p?.name) setPet(p.name);
      setProfile(profileSummary(p));
    });
  }, []);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet]);

  const push = (m: Message) => setMessages((prev) => [...prev, m]);

  const aiSay = (text: string, delay = 600) =>
    new Promise<void>((resolve) => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        push({ id: nextId(), sender: 'ai', kind: 'text', text });
        resolve();
      }, delay);
    });

  function reset() {
    setMessages([
      {
        id: nextId(),
        sender: 'ai',
        kind: 'text',
        text: `Hi! I'm Furlo AI. How is ${pet} doing today?`,
      },
    ]);
    setPhase('start');
    setStepIndex(0);
    setAnswers({});
    setMultiPick([]);
    setFeedback(null);
    setSaved(false);
  }

  async function startTriage(userText: string) {
    push({ id: nextId(), sender: 'user', kind: 'text', text: userText });
    setPhase('triage');
    setStepIndex(-1);
    await aiSay(
      `Sorry to hear that. I'll ask a few quick questions so I can help. Tap an answer, or type your own.`,
    );
    await aiSay(STEPS[0].question(pet), 500);
    setStepIndex(0);
  }

  async function offScript(userText: string) {
    push({ id: nextId(), sender: 'user', kind: 'text', text: userText });
    await aiSay(
      `This demo only has the vomiting flow scripted. Try “${startChips[0]}” to see how Furlo AI triages a symptom.`,
    );
  }

  function handleStartInput(text: string) {
    if (/vomit|threw up|throw up|throwing up|sick|puk/i.test(text)) startTriage(text);
    else offScript(text);
  }

  async function answerStep(selected: string[]) {
    const step = STEPS[stepIndex];
    const next: Answers = { ...answers, [step.key]: selected };
    setAnswers(next);
    setMultiPick([]);
    setStepIndex(-1); // hide chips while Furlo replies
    push({ id: nextId(), sender: 'user', kind: 'text', text: selected.join(', ') });

    // Rules layer runs first: any red flag stops the questions immediately.
    const { red } = triggeredFlags(next);
    const isLast = stepIndex === STEPS.length - 1;
    if (red.length || isLast) {
      await finish(next);
      return;
    }
    await aiSay(STEPS[stepIndex + 1].question(pet), 500);
    setStepIndex(stepIndex + 1);
  }

  async function finish(final: Answers) {
    setPhase('done');
    const urgency = decideUrgency(final);
    if (urgency === 'emergency') {
      await aiSay(`That's on my red-flag list, so I'm stopping the questions here.`, 400);
    } else {
      await aiSay(
        `Thanks, that's everything I need. Checking your answers against Furlo's vet-approved guidance…`,
        500,
      );
    }
    const passages = retrievePassages(final, urgency);
    const advice = buildAdvice(pet, final, urgency, passages);
    const redCount = triggeredFlags(final).red.length;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      push({
        id: nextId(),
        sender: 'ai',
        kind: 'result',
        result: { urgency, passages, advice, answers: final, redCount },
      });
    }, 900);
  }

  function handleSend() {
    const text = inputText.trim();
    if (!text || typing) return;
    setInputText('');
    if (phase === 'start') return handleStartInput(text);
    if (phase === 'triage' && stepIndex >= 0) return answerStep([`Other: ${text}`]);
    if (phase === 'done') {
      push({ id: nextId(), sender: 'user', kind: 'text', text });
      aiSay(`In this demo the conversation ends here. Tap “Start over” to try again.`);
    }
  }

  function toggleMulti(label: string) {
    const step = STEPS[stepIndex];
    const opt = step.options.find((o) => o.label === label);
    setMultiPick((prev) => {
      if (opt?.exclusive) return prev.includes(label) ? [] : [label];
      const withoutExclusive = prev.filter(
        (l) => !step.options.find((o) => o.label === l)?.exclusive,
      );
      return withoutExclusive.includes(label)
        ? withoutExclusive.filter((l) => l !== label)
        : [...withoutExclusive, label];
    });
  }

  async function quickEmergency() {
    push({ id: nextId(), sender: 'user', kind: 'text', text: 'This is an emergency' });
    setPhase('done');
    await aiSay(
      `If ${pet} has collapsed, is struggling to breathe, is bleeding heavily or may have eaten something toxic, call your vet or the nearest 24-hour animal hospital now. Don't wait for the app.`,
    );
  }

  async function quickHistory() {
    push({ id: nextId(), sender: 'user', kind: 'text', text: `Show ${pet}'s recent history` });
    await aiSay(
      `From ${pet}'s health record (sample data)${profile ? `: ${profile}` : ''}. Last vet check-up 3 months ago, vaccinations up to date, no vomiting logged in the past 30 days. I use this history when I answer.`,
    );
  }

  const step = phase === 'triage' && stepIndex >= 0 ? STEPS[stepIndex] : null;
  // Once a conversation has started, collapse the profile bar and quick actions
  // so the chat gets more room.
  const started = messages.length > 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <View style={styles.header}>
        <Bot size={32} color="#ad8b73" />
        <View style={styles.headerText}>
          <Text style={styles.title}>Furlo AI</Text>
          <Text style={styles.subtitle}>Your AI Pet Care Assistant</Text>
        </View>
        {started && <Image source={PET_PHOTOS.avatar} style={styles.headerAvatar} />}
        <TouchableOpacity style={styles.resetButton} onPress={reset}>
          <RotateCcw size={16} color="#ad8b73" />
          <Text style={styles.resetText}>Start over</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.demoBanner}>
        <Text style={styles.demoBannerText}>
          Demo with scripted sample answers. Not veterinary advice.
        </Text>
      </View>

      {!started && (
      <View style={styles.petStrip}>
        <Image source={PET_PHOTOS.avatar} style={styles.petStripAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.petStripName}>{`Chatting about ${pet}`}</Text>
          {profile && <Text style={styles.petStripMeta}>{profile}</Text>}
        </View>
      </View>

      )}

      {!started && (
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={quickEmergency}>
          <AlertCircle size={20} color="#f44336" />
          <Text style={styles.quickActionText}>Emergency</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => {
            reset();
            setTimeout(() => startTriage(startChips[0]), 50);
          }}>
          <Stethoscope size={20} color="#4CAF50" />
          <Text style={styles.quickActionText}>Symptoms</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickAction} onPress={quickHistory}>
          <Clock size={20} color="#2196F3" />
          <Text style={styles.quickActionText}>History</Text>
        </TouchableOpacity>
      </View>

      )}

      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 16 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m) =>
          m.kind === 'text' ? (
            <View
              key={m.id}
              style={[
                styles.messageWrapper,
                m.sender === 'user' ? styles.userMessageWrapper : styles.aiMessageWrapper,
              ]}>
              <View style={[styles.message, m.sender === 'user' ? styles.userMessage : styles.aiMessage]}>
                <Text
                  style={[
                    styles.messageText,
                    m.sender === 'user' ? styles.userMessageText : styles.aiMessageText,
                  ]}>
                  {m.text}
                </Text>
              </View>
            </View>
          ) : (
            <ResultCard
              key={m.id}
              pet={pet}
              profile={profile}
              result={m.result}
              feedback={feedback}
              onFeedback={setFeedback}
              saved={saved}
              onSave={() => setSaved(true)}
            />
          ),
        )}

        {typing && (
          <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
            <View style={[styles.message, styles.aiMessage]}>
              <Text style={[styles.messageText, styles.typingText]}>Furlo AI is typing…</Text>
            </View>
          </View>
        )}

        {!typing && phase === 'start' && (
          <View style={styles.chipsWrap}>
            {startChips.map((c) => (
              <TouchableOpacity key={c} style={styles.chip} onPress={() => handleStartInput(c)}>
                <Text style={styles.chipText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!typing && step && (
          <View>
            <Text style={styles.stepCounter}>
              {`Question ${stepIndex + 1} of ${STEPS.length}${step.multi ? ' · select all that apply' : ''}`}
            </Text>
            <View style={styles.chipsWrap}>
              {step.options.map((o) => {
                const picked = multiPick.includes(o.label);
                return (
                  <TouchableOpacity
                    key={o.label}
                    style={[styles.chip, picked && styles.chipPicked]}
                    onPress={() => (step.multi ? toggleMulti(o.label) : answerStep([o.label]))}>
                    {picked && <Check size={14} color="#fff" style={{ marginRight: 4 }} />}
                    {o.swatch && <View style={[styles.swatch, { backgroundColor: o.swatch }]} />}
                    <Text style={[styles.chipText, picked && styles.chipTextPicked]}>{o.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {step.multi && (
              <TouchableOpacity
                style={[styles.doneButton, !multiPick.length && styles.doneButtonDisabled]}
                disabled={!multiPick.length}
                onPress={() => answerStep(multiPick)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={step ? 'Or type your own answer…' : 'Type your message...'}
          placeholderTextColor="#999"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function ResultCard({
  pet,
  profile,
  result,
  feedback,
  onFeedback,
  saved,
  onSave,
}: {
  pet: string;
  profile: string | null;
  result: Result;
  feedback: 'up' | 'down' | null;
  onFeedback: (f: 'up' | 'down') => void;
  saved: boolean;
  onSave: () => void;
}) {
  const [showTrace, setShowTrace] = useState(false);
  const meta = URGENCY_META[result.urgency];
  const { advice, passages, answers } = result;
  const understood = STEPS.filter((s) => answers[s.key]?.length);

  return (
    <View style={styles.resultCard}>
      <View style={[styles.urgencyBadge, { backgroundColor: meta.bg, borderColor: meta.colour }]}>
        <Text style={[styles.urgencyText, { color: meta.colour }]}>{meta.label}</Text>
      </View>

      <Text style={styles.resultHeadline}>{advice.headline}</Text>
      <Text style={styles.resultBody}>{advice.body}</Text>

      {advice.doNow.length > 0 && (
        <>
          <Text style={styles.resultSection}>What to do now</Text>
          {advice.doNow.map((d) => (
            <Text key={d} style={styles.bullet}>{`• ${d}`}</Text>
          ))}
        </>
      )}

      {advice.callVetIf.length > 0 && (
        <>
          <Text style={styles.resultSection}>Call your vet if</Text>
          {advice.callVetIf.map((d) => (
            <Text key={d} style={styles.bullet}>{`• ${d}`}</Text>
          ))}
        </>
      )}

      <Text style={styles.resultSection}>Sources</Text>
      {passages.map((p) => (
        <Text key={p.id} style={styles.source}>
          {`[${p.id}] Furlo Vet Knowledge Base · ${p.title} (sample entry)`}
        </Text>
      ))}

      <TouchableOpacity style={styles.traceToggle} onPress={() => setShowTrace((v) => !v)}>
        <Text style={styles.traceToggleText}>How Furlo AI decided</Text>
        {showTrace ? <ChevronUp size={16} color="#ad8b73" /> : <ChevronDown size={16} color="#ad8b73" />}
      </TouchableOpacity>

      {showTrace && (
        <View style={styles.trace}>
          <TraceStep
            icon={<ListChecks size={16} color="#ad8b73" />}
            title="1. Understood your answers"
            detail={`An LLM turns your taps and free text into structured details, combined with ${pet}'s profile:`}>
            <View style={styles.fieldWrap}>
              {profile && (
                <View style={[styles.fieldPill, styles.profilePill]}>
                  <Text style={styles.fieldPillText}>{`Profile: ${profile}`}</Text>
                </View>
              )}
              {understood.map((s) => (
                <View key={s.key} style={styles.fieldPill}>
                  <Text style={styles.fieldPillText}>{`${s.field}: ${answers[s.key]!.join(', ')}`}</Text>
                </View>
              ))}
            </View>
          </TraceStep>
          <TraceStep
            icon={<ShieldCheck size={16} color="#ad8b73" />}
            title="2. Checked vet-written red-flag rules first"
            detail={`${RED_FLAG_RULE_COUNT} rules checked · ${result.redCount} triggered. The rules run before the AI writes anything, so spotting an emergency never depends on the AI.`}
          />
          <TraceStep
            icon={<BookOpen size={16} color="#ad8b73" />}
            title="3. Retrieved vet-approved guidance (RAG)"
            detail={`Looked up ${passages.length} relevant passage${passages.length === 1 ? '' : 's'} in the knowledge base instead of answering from memory.`}
          />
          <TraceStep
            icon={<Sparkles size={16} color="#ad8b73" />}
            title="4. Wrote the answer from those passages only"
            detail={`Urgency: ${URGENCY_META[result.urgency].label}. Each point cites its source. If nothing relevant is found, Furlo says “I don’t know, please see a vet”.`}
          />
          <TraceStep
            icon={<MessageSquareHeart size={16} color="#ad8b73" />}
            title="5. Your rating improves the system"
            detail="Low-rated answers go to our vet advisor. Their fixes update the rules, the knowledge base and the test set we use to check accuracy."
          />
        </View>
      )}

      <View style={styles.resultActions}>
        <TouchableOpacity style={[styles.actionButton, saved && styles.actionButtonDone]} onPress={onSave}>
          <NotebookPen size={16} color={saved ? '#fff' : '#ad8b73'} />
          <Text style={[styles.actionButtonText, saved && { color: '#fff' }]}>
            {saved ? `Saved to ${pet}'s health record` : `Save to ${pet}'s health record`}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedbackRow}>
        <Text style={styles.feedbackLabel}>
          {feedback === 'down'
            ? 'Thanks. This answer has been sent to our vet advisor for review.'
            : feedback === 'up'
              ? 'Thanks for the feedback!'
              : 'Was this helpful?'}
        </Text>
        {!feedback && (
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={styles.thumb} onPress={() => onFeedback('up')}>
              <ThumbsUp size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.thumb} onPress={() => onFeedback('down')}>
              <ThumbsDown size={18} color="#666" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

function TraceStep({
  icon,
  title,
  detail,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.traceStep}>
      <View style={styles.traceTitleRow}>
        {icon}
        <Text style={styles.traceTitle}>{title}</Text>
      </View>
      <Text style={styles.traceDetail}>{detail}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerText: { marginLeft: 12, flex: 1 },
  title: { fontFamily: 'Poppins-SemiBold', fontSize: 24, color: '#333' },
  subtitle: { fontFamily: 'Nunito-Regular', fontSize: 14, color: '#666' },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f8f3ef',
  },
  resetText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#ad8b73', marginLeft: 4 },
  demoBanner: {
    marginHorizontal: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff8e1',
  },
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  petStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 10,
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8f3ef',
  },
  petStripAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  petStripName: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#333' },
  petStripMeta: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#777' },
  demoBannerText: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#8a6d00', textAlign: 'center' },
  quickActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: '#333', marginLeft: 4 },
  messagesContainer: { flex: 1, padding: 16 },
  messageWrapper: { marginBottom: 12, flexDirection: 'row' },
  userMessageWrapper: { justifyContent: 'flex-end' },
  aiMessageWrapper: { justifyContent: 'flex-start' },
  message: { maxWidth: '82%', padding: 12, borderRadius: 16 },
  userMessage: { backgroundColor: '#ad8b73', borderTopRightRadius: 4 },
  aiMessage: { backgroundColor: '#f5f5f5', borderTopLeftRadius: 4 },
  messageText: { fontFamily: 'Nunito-Regular', fontSize: 16, lineHeight: 23 },
  userMessageText: { color: '#fff' },
  aiMessageText: { color: '#333' },
  typingText: { color: '#999', fontStyle: 'italic' },
  stepCounter: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#999', marginBottom: 6 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ad8b73',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  chipPicked: { backgroundColor: '#ad8b73' },
  swatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
  },
  chipText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#ad8b73' },
  chipTextPicked: { color: '#fff' },
  doneButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#ad8b73',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 8,
  },
  doneButtonDisabled: { opacity: 0.4 },
  doneButtonText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#fff' },
  resultCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  urgencyText: { fontFamily: 'Nunito-Bold', fontSize: 13 },
  resultHeadline: { fontFamily: 'Poppins-SemiBold', fontSize: 17, color: '#333', marginBottom: 6 },
  resultBody: { fontFamily: 'Nunito-Regular', fontSize: 15, lineHeight: 22, color: '#444' },
  resultSection: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#333', marginTop: 12, marginBottom: 4 },
  bullet: { fontFamily: 'Nunito-Regular', fontSize: 14, lineHeight: 21, color: '#444' },
  source: { fontFamily: 'Nunito-Regular', fontSize: 12, lineHeight: 18, color: '#777' },
  traceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  traceToggleText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: '#ad8b73', marginRight: 4 },
  trace: { marginTop: 8 },
  traceStep: { backgroundColor: '#faf7f4', borderRadius: 10, padding: 10, marginBottom: 8 },
  traceTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  traceTitle: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#333', marginLeft: 6 },
  traceDetail: { fontFamily: 'Nunito-Regular', fontSize: 13, lineHeight: 19, color: '#555' },
  fieldWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 6 },
  fieldPill: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8ddd4',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 6,
  },
  profilePill: { backgroundColor: '#f8f3ef' },
  fieldPillText: { fontFamily: 'Nunito-Regular', fontSize: 12, color: '#555' },
  resultActions: { flexDirection: 'row', marginTop: 12 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ad8b73',
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionButtonDone: { backgroundColor: '#ad8b73' },
  actionButtonText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: '#ad8b73', marginLeft: 6 },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  feedbackLabel: { fontFamily: 'Nunito-Regular', fontSize: 13, color: '#666', flex: 1 },
  thumb: { padding: 6, marginLeft: 6, borderRadius: 16, backgroundColor: '#f5f5f5' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontFamily: 'Nunito-Regular',
    fontSize: 16,
    color: '#333',
  },
  sendButton: {
    backgroundColor: '#ad8b73',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
