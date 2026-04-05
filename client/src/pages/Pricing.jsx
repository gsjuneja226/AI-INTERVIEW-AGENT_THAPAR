import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"
import { BsArrowLeft, BsLightningChargeFill, BsCheckCircleFill, BsArrowRightShort, BsShieldLockFill, BsPhone, BsCreditCard, BsBank, BsQrCodeScan } from 'react-icons/bs'
import { RiSecurePaymentFill } from 'react-icons/ri'
import logo from "../assets/RAGCRUIT.png"
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';


function Pricing() {
  const navigate = useNavigate()
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [showSimulatedModal, setShowSimulatedModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const dispatch = useDispatch()

  const plans = [
    {
      id: "free",
      name: "Free Starter",
      price: "₹0",
      credits: 100,
      description: "Introductory allocation of credits for your first practice sessions.",
      default: true,
    },
    {
      id: "basic",
      name: "Essential Prep",
      price: "₹100",
      credits: 150,
      description: "Get 150 additional credits for focused preparation on a specific company.",
    },
    {
      id: "pro",
      name: "Professional Edge",
      price: "₹500",
      credits: 1000,
      description: "Best for peak placement seasons. Includes 1000 credits for unlimited preparation.",
      badge: "MOST POPULAR",
    },
  ];

  const handlePayment = async (plan) => {
    // We strictly use the Simulated Modal now to fulfill the "opens up" and "fake setup" request
    setShowSimulatedModal(true);
  }

  const handleSimulatedSuccess = async () => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;

    try {
      setIsProcessing(true);
      // Simulate real processing time
      await new Promise(resolve => setTimeout(resolve, 2500));

      const response = await axios.post(ServerUrl + "/api/payment/fake-success", {
        planId: plan.id,
        amount: plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0,
        credits: plan.credits,
      }, { withCredentials: true })

      if (response.data.success) {
        dispatch(setUserData(response.data.user))
        setShowSimulatedModal(false);
        alert(`Payment Successful! ${plan.credits} credits added.`);
        navigate("/");
      }
    } catch (error) {
      console.error("Simulation Error:", error);
      alert("Something went wrong with the simulation.");
    } finally {
      setIsProcessing(false);
    }
  }

  const SimulatedRazorpayModal = () => {
    const plan = plans.find(p => p.id === selectedPlan);

    return (
      <AnimatePresence>
        {showSimulatedModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-[400px] rounded-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="bg-[#2563eb] p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">RAGCRUIT Systems</h4>
                    <p className="text-[10px] text-white/70 uppercase tracking-widest font-black">Secure Checkout</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/50 uppercase font-black">Amount Payable</p>
                  <p className="text-xl font-black">{plan?.price}</p>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {!isProcessing ? (
                  <>
                    <div className="flex items-center gap-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="bg-blue-100 p-2 text-blue-600 rounded-lg">
                        <BsLightningChargeFill size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Plan</p>
                        <p className="text-sm font-bold text-slate-900">{plan?.name} • {plan?.credits} Credits</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Payment Method</p>
                      <button onClick={handleSimulatedSuccess} className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 px-5 hover:bg-slate-50 transition-all hover:border-blue-200 group">
                        <BsPhone className="text-slate-400 group-hover:text-blue-500" size={18} />
                        <span className="text-sm font-bold text-slate-700 flex-1 text-left">UPI / Google Pay / PhonePe</span>
                        <div className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-black uppercase tracking-tighter">Fast</div>
                      </button>
                      <button onClick={handleSimulatedSuccess} className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 px-5 hover:bg-slate-50 transition-all hover:border-blue-200 group">
                        <BsCreditCard className="text-slate-400 group-hover:text-blue-500" size={18} />
                        <span className="text-sm font-bold text-slate-700 flex-1 text-left">Cards (Visa, MaterCard, Amex)</span>
                      </button>
                      <button onClick={handleSimulatedSuccess} className="w-full h-14 bg-white border border-slate-200 rounded-2xl flex items-center gap-4 px-5 hover:bg-slate-50 transition-all hover:border-blue-200 group">
                        <BsBank className="text-slate-400 group-hover:text-blue-500" size={18} />
                        <span className="text-sm font-bold text-slate-700 flex-1 text-left">Netbanking</span>
                      </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-3 text-slate-400">
                      <BsShieldLockFill size={14} />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em]">100% Secure Transaction by Razorpay</span>
                    </div>

                    <button
                      onClick={() => setShowSimulatedModal(false)}
                      className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </>
                ) : (
                  <div className="py-20 flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                    <h5 className="text-lg font-black text-slate-900 tracking-tight">Processing Payment...</h5>
                    <p className="text-slate-400 text-xs font-bold mt-2">Please do not refresh the page</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className='h-screen w-full bg-slate-50 relative overflow-y-auto font-sans text-slate-900 scrollbar-hide'>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/30 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>

      <div className='max-w-6xl mx-auto py-10 px-6 flex flex-col items-center md:items-start relative z-10'>
        <button onClick={() => navigate("/")} className='mb-6 inline-flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-widest'>
          <BsArrowLeft size={16} /> Back to Dashboard
        </button>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none text-center md:text-left">
          Scale Your <span className="text-blue-600">Preparation.</span>
        </h1>
        <p className="text-slate-500 mt-4 text-base md:text-lg max-w-xl font-medium leading-relaxed text-center md:text-left">
          Acquire credits to access professional AI assessments and context-aware technical interview simulations.
        </p>
      </div>

      <div className='max-w-7xl mx-auto px-6 pb-20 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              onClick={() => !plan.default && setSelectedPlan(plan.id)}
              animate={{
                y: isSelected ? -10 : 0,
              }}
              className={`relative p-8 rounded-[2.5rem] transition-all cursor-pointer bg-white border flex flex-col h-full
                   ${isSelected
                  ? "border-blue-600 shadow-[0_30px_60px_-15px_rgba(37,99,235,0.15)] ring-1 ring-blue-600"
                  : "border-slate-100 shadow-sm hover:border-blue-200"
                }
                   ${plan.default ? "cursor-default opacity-85" : ""}
                 `}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white font-black tracking-[0.2em] text-[8px] px-8 py-2.5 rounded-full shadow-xl shadow-blue-600/20 uppercase whitespace-nowrap z-20">
                  {plan.badge}
                </div>
              )}

              <div className="flex-1">
                <h3 className={`text-xl font-black mb-1 tracking-tight ${isSelected ? "text-blue-600" : "text-slate-900"}`}>
                  {plan.name}
                </h3>

                <div className='mb-6'>
                  <span className={`text-5xl font-black tracking-tighter text-slate-900`}>
                    {plan.price}
                  </span>
                  {plan.price !== "₹0" && <span className="text-slate-300 font-black text-[9px] ml-2 uppercase tracking-widest">Total</span>}
                </div>

                <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl mb-6 border transition-all ${isSelected ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-blue-50 text-blue-700 border-blue-100"}`}>
                  <BsLightningChargeFill className={isSelected ? "text-white" : "text-blue-600"} size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{plan.credits} Credits</span>
                </div>

                <p className="text-slate-400 text-xs leading-relaxed mb-10 font-bold">
                  {plan.description}
                </p>
              </div>

              {!plan.default ? (
                <button
                  disabled={loadingPlan === plan.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isSelected) {
                      setSelectedPlan(plan.id);
                    } else {
                      handlePayment(plan)
                    }
                  }}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] transition-all
                       ${isSelected
                      ? "bg-slate-900 hover:bg-black text-white shadow-xl scale-[1.01]"
                      : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                    }
                     `}>
                  {loadingPlan === plan.id ? "Initializing..." : isSelected ? "Purchase Credits" : "Select Plan"}
                </button>
              ) : (
                <div className="w-full py-5 rounded-2xl bg-slate-50 text-slate-300 font-black uppercase tracking-[0.2em] text-[9px] text-center border border-slate-100 border-dashed">
                  Current Tier
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="max-w-5xl mx-auto mb-20 px-6 relative z-10">
        <div className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/40 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 opacity-50"></div>

          <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">University Assessments?</h4>
          <p className="text-slate-400 font-bold text-xs mb-8 max-w-sm mx-auto uppercase tracking-wide">Scalable solutions for academic institutions during peak placement seasons.</p>
          <button className="bg-blue-50 text-blue-600 px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[9px] border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-3 mx-auto">
            Contact Support <BsArrowRightShort size={20} />
          </button>
        </div>
      </div>

      <SimulatedRazorpayModal />
    </div>
  )
}

export default Pricing
