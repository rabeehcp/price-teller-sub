import React, { useState, useEffect, useRef } from 'react';
import { BasketItem, FullComparisonResponse, Shop, User, Conversation, ChatMessage, BasketSnapshot } from '../types';
import {
  createConversationApi,
  fetchConversationMessagesApi,
  fetchConversationsApi,
  sendMessageApi,
  updateConversationBasketApi,
  markConversationReadApi,
} from '../services/api';
import {
  X,
  Send,
  MessageCircle,
  Store,
  Clock,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info,
  CheckCheck,
  Phone,
} from 'lucide-react';

export const formatChatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const dateFormatted = d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timeFormatted = d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${dateFormatted}, ${timeFormatted}`;
};

interface ConsumerChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  authUser: User | null;
  shops: Shop[];
  initialShopName?: string | null;
  basketItems: BasketItem[];
  comparison: FullComparisonResponse | null;
  locationName?: string;
  onRequireAuth?: () => void;
}

const QUICK_INQUIRIES = [
  '👋 നമസ്കാരം! ബാസ്ക്കറ്റിലെ സാധനങ്ങൾ ഇപ്പോൾ സ്റ്റോക്കുണ്ടോ?',
  '⏰ 1 മണിക്കൂറിനുള്ളിൽ പിക്കപ്പ് ചെയ്യാൻ റെഡിയാകുമോ?',
  '🚚 ഈ ഓർഡറിന് ഹോം ഡെലിവറി ലഭ്യമാണോ?',
  '🌿 പച്ചക്കറികളും പഴങ്ങളും പുതിയ സ്റ്റോക്കാണോ?',
  '💳 UPI / Google Pay സ്വീകരിക്കുമോ?',
];

export const ConsumerChatModal: React.FC<ConsumerChatModalProps> = ({
  isOpen,
  onClose,
  authUser,
  shops,
  initialShopName,
  basketItems,
  comparison,
  locationName = 'Tirur',
  onRequireAuth,
}) => {
  if (!isOpen) return null;

  // Determine target shop
  const defaultShopName =
    initialShopName ||
    comparison?.bestShopName ||
    shops[0]?.name ||
    'Green Mart';

  const [selectedShopName, setSelectedShopName] = useState<string>(defaultShopName);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showBasketBreakdown, setShowBasketBreakdown] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentShop = shops.find((s) => s.name === selectedShopName) || shops[0];
  const comparisonShop = comparison?.shops.find((s) => s.shopName === selectedShopName);

  // Compute basket snapshot for current shop
  const basketSnapshot: BasketSnapshot = React.useMemo(() => {
    const items = basketItems.map((item) => {
      const minBasePrice = Math.min(...Object.values(item.product.prices || { '0': 50 }));
      const storePrice =
        item.product.prices && item.product.prices[selectedShopName] !== undefined
          ? item.product.prices[selectedShopName]
          : minBasePrice;
      const multiplier = item.product.unitMultiplier[item.selectedUnit] ?? 1;
      const unitPrice = Math.round(storePrice * multiplier);
      return {
        productId: item.productId,
        productName: item.product.name,
        emoji: item.product.emoji,
        quantity: item.quantity,
        unit: item.selectedUnit,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const total = comparisonShop
      ? comparisonShop.total
      : items.reduce((acc, it) => acc + (it.lineTotal || 0), 0);

    return {
      items,
      itemCount: basketItems.length,
      totalQuantity: basketItems.reduce((acc, it) => acc + it.quantity, 0),
      estimatedTotal: total,
      shopName: selectedShopName,
      shopId: currentShop?.id || 'custom',
      locationName,
      createdAt: new Date().toISOString(),
    };
  }, [basketItems, selectedShopName, currentShop, comparisonShop, locationName]);

  // Load existing conversations for this consumer
  const loadConversations = async (targetConvId?: string) => {
    if (!authUser?.token) return;
    try {
      const convs = await fetchConversationsApi(authUser.token);
      setConversations(convs);

      // Match conversation for selected shop or target ID
      if (targetConvId) {
        const found = convs.find((c) => c.id === targetConvId);
        if (found) {
          setActiveConversation(found);
          // Sync latest basket to found conversation
          if (basketSnapshot) {
            updateConversationBasketApi(found.id, basketSnapshot, authUser.token).catch(() => {});
          }
        }
      } else {
        const existingForShop = convs.find(
          (c) => c.shopName.toLowerCase() === selectedShopName.toLowerCase()
        );
        if (existingForShop) {
          setActiveConversation(existingForShop);
          // Sync latest basket to found conversation
          if (basketSnapshot) {
            updateConversationBasketApi(existingForShop.id, basketSnapshot, authUser.token).catch(() => {});
          }
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  };

  // Poll messages for active conversation
  const loadMessages = async (convId: string, silent = false) => {
    if (!authUser?.token) return;
    if (!silent) setIsLoading(true);
    try {
      const res = await fetchConversationMessagesApi(convId, authUser.token);
      if (res) {
        setMessages((prev) => {
          // Keep local pending/failed messages not yet on server
          const serverIds = new Set(res.messages.map((m) => m.id));
          const serverClientMsgIds = new Set(res.messages.map((m) => m.clientMsgId).filter(Boolean));
          const localPending = prev.filter(
            (m) =>
              (m.status === 'sending' || m.status === 'failed') &&
              !serverIds.has(m.id) &&
              (!m.clientMsgId || !serverClientMsgIds.has(m.clientMsgId))
          );
          return [...res.messages, ...localPending];
        });
        setActiveConversation(res.conversation);
        // Mark conversation as read
        markConversationReadApi(convId, authUser.token).catch(() => {});
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Initial load when modal opens or shop changes
  useEffect(() => {
    if (authUser) {
      loadConversations();
    }
  }, [authUser, selectedShopName]);

  // Load messages when activeConversation changes
  useEffect(() => {
    if (activeConversation?.id) {
      loadMessages(activeConversation.id);
    } else {
      setMessages([]);
    }
  }, [activeConversation?.id]);

  // Auto-poll messages every 2.5 seconds
  useEffect(() => {
    if (!activeConversation?.id || !authUser?.token) return;
    const interval = setInterval(() => {
      loadMessages(activeConversation.id, true);
    }, 2500);
    return () => clearInterval(interval);
  }, [activeConversation?.id, authUser?.token]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Send message handler with deduplication & retry support
  const handleSendMessage = async (textToSend?: string, existingClientMsgId?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!authUser) {
      if (onRequireAuth) onRequireAuth();
      return;
    }

    if (isSending && !existingClientMsgId) return;

    const clientMsgId = existingClientMsgId || `cmsg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tempId = `temp-${clientMsgId}`;

    if (!existingClientMsgId) {
      setInputText('');
      // Optimistically add message
      const optimisticMsg: ChatMessage = {
        id: tempId,
        conversationId: activeConversation?.id || 'pending',
        senderId: authUser.id,
        senderRole: 'consumer',
        senderName: authUser.name || 'You',
        text,
        basketSnapshot,
        status: 'sending',
        clientMsgId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
    } else {
      // Mark as retrying
      setMessages((prev) =>
        prev.map((m) => (m.clientMsgId === existingClientMsgId ? { ...m, status: 'sending' } : m))
      );
    }

    setIsSending(true);

    try {
      if (!activeConversation) {
        // Create new conversation with attached basket snapshot
        const res = await createConversationApi(
          {
            shopId: currentShop?.id || 'custom',
            shopName: selectedShopName,
            basketSnapshot,
            initialMessage: text,
          },
          authUser.token
        );
        setActiveConversation(res.conversation);
        if (res.initialMessage) {
          setMessages([res.initialMessage]);
        }
        await loadConversations(res.conversation.id);
      } else {
        // Send message to existing conversation along with updated basket snapshot and clientMsgId
        const newMsg = await sendMessageApi(
          activeConversation.id,
          text,
          authUser.token,
          basketSnapshot,
          clientMsgId
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.clientMsgId === clientMsgId || m.id === tempId ? { ...newMsg, status: 'sent' } : m
          )
        );
      }
    } catch (err: any) {
      // Mark message as failed so user can click retry
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMsgId === clientMsgId || m.id === tempId ? { ...m, status: 'failed' } : m
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full h-[94dvh] sm:h-[90vh] max-h-[750px] shadow-2xl border border-gray-100 flex flex-col overflow-hidden relative">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white p-3.5 sm:px-6 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand-600/30 border border-brand-400/30 flex items-center justify-center text-lg sm:text-xl shadow-inner shrink-0">
              🏪
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {shops.length > 1 ? (
                  <select
                    value={selectedShopName}
                    onChange={(e) => setSelectedShopName(e.target.value)}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs sm:text-base rounded-xl px-2 py-0.5 outline-none cursor-pointer transition-colors max-w-[150px] sm:max-w-none"
                  >
                    {shops.map((s) => (
                      <option key={s.id || s.name} value={s.name} className="bg-slate-900 text-white">
                        {s.name} {s.isVerified ? '✓' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <h3 className="text-sm sm:text-base font-black text-white truncate">{selectedShopName}</h3>
                )}
                {currentShop?.isVerified && (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-300 flex items-center gap-1 mt-0.5 truncate">
                <Store className="w-3 h-3 text-brand-400 shrink-0" />
                <span className="truncate">{currentShop?.address || 'Local Market'}</span>
                <span>·</span>
                <span className="shrink-0">⭐ {currentShop?.rating || 4.5}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {currentShop?.phone && (
              <a
                href={`tel:${currentShop.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-white border border-emerald-400/30 text-xs font-bold transition-all cursor-pointer font-malayalam active:scale-95 shadow-xs"
                title={`${currentShop.name} വിളിക്കുക`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">വിളിക്കുക</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Attached Basket Snapshot Banner (Collapsible) */}
        <div className="bg-[#f5f8f3] border-b border-brand-100/80 px-3 sm:px-4 py-2 text-xs text-slate-dark shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs shrink-0">
                🛒
              </span>
              <span className="font-extrabold text-slate-dark text-xs truncate">
                Basket ({basketSnapshot.itemCount} items)
              </span>
              <span className="text-brand-700 font-black bg-brand-100/70 border border-brand-200 px-1.5 sm:px-2 py-0.5 rounded-md text-[11px] sm:text-xs shrink-0">
                ₹{Math.round(basketSnapshot.estimatedTotal)}
              </span>
            </div>

            <button
              onClick={() => setShowBasketBreakdown(!showBasketBreakdown)}
              className="text-[10px] sm:text-[11px] font-bold text-gray-600 hover:text-brand-800 flex items-center gap-1 cursor-pointer bg-white border border-gray-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-2xs shrink-0 active:scale-95"
            >
              <span>{showBasketBreakdown ? 'Hide' : 'Items'}</span>
              {showBasketBreakdown ? (
                <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              ) : (
                <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </button>
          </div>

          {/* Collapsible item tags */}
          {showBasketBreakdown && (
            <div className="mt-2 pt-2 border-t border-brand-100/60 flex flex-wrap gap-1 max-h-20 sm:max-h-24 overflow-y-auto">
              {basketSnapshot.items.map((it) => (
                <span
                  key={it.productId}
                  className="inline-flex items-center gap-1 bg-white border border-brand-200/80 px-1.5 sm:px-2 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-semibold text-slate-dark shadow-2xs"
                >
                  <span>{it.emoji}</span>
                  <span>{it.productName}</span>
                  <span className="text-gray-400 font-normal">
                    ({it.quantity} × {it.unit})
                  </span>
                  <span className="text-brand-700 font-bold">₹{Math.round(it.lineTotal || 0)}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chat Thread Body */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-[#fafbfa]">
          {/* Welcome / Context Note */}
          <div className="bg-brand-50/80 border border-brand-200/60 rounded-2xl p-2.5 sm:p-3 text-[11px] sm:text-xs text-brand-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <b>Direct Merchant Messaging:</b> Inquire about live stock, price discounts, same-day delivery, or special pre-booking directly with <b>{selectedShopName}</b>. Your basket details are attached.
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-brand-600" />
              <span>Loading conversation history...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 sm:py-10 px-4 border-2 border-dashed border-gray-200 rounded-2xl my-2 bg-white">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-2xl mb-2">
                💬
              </div>
              <b className="block text-xs sm:text-sm font-bold text-slate-dark mb-1">
                Start conversation with {selectedShopName}
              </b>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-2">
                Ask about availability, custom quantities, or delivery times. Tap a suggested question below or type your own!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderRole === 'consumer' || msg.senderId === authUser?.id;
              const formattedDateTime = formatChatDateTime(msg.createdAt);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-gray-500">
                      {isMe ? 'You (Shopper)' : `${msg.senderName || selectedShopName} (Merchant)`}
                    </span>
                    <span className="text-[10px] text-gray-400">· {formattedDateTime}</span>
                    {isMe && msg.status === 'sending' && (
                      <span className="text-[9px] text-amber-500 flex items-center gap-0.5">
                        <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Sending...
                      </span>
                    )}
                    {isMe && msg.status === 'failed' && (
                      <span className="text-[9px] text-red-500 font-bold flex items-center gap-1">
                        Failed
                        <button
                          onClick={() => handleSendMessage(msg.text, msg.clientMsgId)}
                          className="underline hover:text-red-700 cursor-pointer font-extrabold"
                        >
                          Retry
                        </button>
                      </span>
                    )}
                    {isMe && msg.isRead && !msg.status && (
                      <span className="text-[9px] text-emerald-600 font-semibold">Seen ✓✓</span>
                    )}
                  </div>

                  <div
                    className={`max-w-[90%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? msg.status === 'failed'
                          ? 'bg-red-500 text-white rounded-tr-xs font-medium'
                          : 'bg-brand-600 text-white rounded-tr-xs font-medium'
                        : 'bg-white text-slate-dark border border-gray-200 rounded-tl-xs'
                    }`}
                  >
                    <div>{msg.text}</div>

                    {msg.basketSnapshot && msg.basketSnapshot.items?.length > 0 && (
                      <div
                        className={`mt-2 pt-1.5 border-t rounded-xl p-2 text-xs ${
                          isMe
                            ? 'bg-black/15 border-white/20 text-white'
                            : 'bg-[#f5f8f3] border-brand-200 text-slate-dark'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1 text-[10px] sm:text-[11px]">
                          <span className="flex items-center gap-1">
                            <span>🛒</span>
                            <span>
                              Attached Basket ({msg.basketSnapshot.itemCount || msg.basketSnapshot.items.length} items)
                            </span>
                          </span>
                          <span
                            className={`font-black px-1.5 py-0.5 rounded text-[10px] sm:text-[11px] ${
                              isMe ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-800'
                            }`}
                          >
                            ₹{Math.round(msg.basketSnapshot.estimatedTotal)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.basketSnapshot.items.map((it, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-semibold ${
                                isMe
                                  ? 'bg-white/20 text-white border border-white/15'
                                  : 'bg-white text-slate-dark border border-brand-200 shadow-2xs'
                              }`}
                            >
                              <span>{it.emoji}</span>
                              <span>{it.productName}</span>
                              <span className={isMe ? 'text-white/80' : 'text-gray-400'}>
                                ({it.quantity} × {it.unit})
                              </span>
                              {it.lineTotal ? (
                                <span
                                  className={
                                    isMe ? 'text-white font-bold' : 'text-brand-700 font-bold'
                                  }
                                >
                                  ₹{Math.round(it.lineTotal)}
                                </span>
                              ) : null}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Inquiry Suggestions */}
        <div className="bg-white border-t border-gray-100 px-2.5 sm:px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Quick:
          </span>
          {QUICK_INQUIRIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isSending}
              className="text-[11px] font-semibold text-gray-700 hover:text-brand-800 bg-gray-50 hover:bg-brand-50 border border-gray-200 hover:border-brand-300 px-2 sm:px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer shrink-0 disabled:opacity-50 active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Footer */}
        <div className="p-2.5 sm:p-4 bg-white border-t border-gray-200 flex flex-col gap-2 shrink-0">
          {basketSnapshot.itemCount > 0 && (
            <div className="flex items-center justify-between bg-brand-50/80 border border-brand-200/80 px-2.5 py-1 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] text-brand-900">
              <span className="flex items-center gap-1 font-medium truncate">
                <ShoppingBag className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                <span className="truncate">
                  Attached: <b>{basketSnapshot.itemCount} items</b>
                </span>
              </span>
              <span className="font-extrabold text-brand-700 bg-white border border-brand-200 px-1.5 py-0.5 rounded-md shrink-0 ml-1.5">
                ₹{Math.round(basketSnapshot.estimatedTotal)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Ask ${selectedShopName} about your basket...`}
              className="flex-1 bg-gray-50 border border-gray-300 focus:border-brand-500 focus:bg-white rounded-xl sm:rounded-2xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-dark outline-none transition-all"
              disabled={isSending}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white p-2.5 sm:px-5 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 min-w-[42px] min-h-[42px]"
            >
              {isSending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
