---
title: Why the First AI Fix for an Android Crash Can Be Wrong - Feedback v1
date: 2026-03-20
---
source:
https://levelup.gitconnected.com/why-the-first-ai-fix-for-an-android-crash-can-be-wrong-e4b000ebbee6

LLM tools are already part of everyday development. They are fast, often useful, and in many cases very good at reading code and stack traces. Claude is widely regarded as one of the strongest coding models available today, which is exactly why this example matters.

Recently I used Claude to analyze a crash in a legacy Android project. That detail matters. In legacy code, listeners, callbacks, and ==fragment contracts== are often not very elegant, but they still carry real behavior. That makes “simple” fixes more dangerous than they look.

==what is a fragment contract?==

The crash itself was straightforward:

```java
Fatal Exception: java.lang.RuntimeException:  
com.mishloha.mishapp.activity.MainActivity@e2c8808  
must implement DiscountCodeDialogListener  
    at com.mishloha.mishapp.fragment.discountcode.DiscountCodeDialog.onAttach(DiscountCodeDialog.kt:50)  
    at androidx.fragment.app.Fragment.performAttach(Fragment.java:3075)  
    at androidx.fragment.app.FragmentStateManager.attach(FragmentStateManager.java:510)  
    at androidx.fragment.app.FragmentStateManager.moveToExpectedState(FragmentStateManager.java:279)  
    at androidx.fragment.app.FragmentManager.executeOpsTogether(FragmentManager.java:2214)  
    at androidx.fragment.app.FragmentManager.removeRedundantOperationsAndExecute(FragmentManager.java:2115)  
    at androidx.fragment.app.FragmentManager.execPendingActions(FragmentManager.java:2052)  
    at androidx.fragment.app.FragmentManager$5.run(FragmentManager.java:703)  
    at android.os.Handler.handleCallback(Handler.java:959)  
    at android.os.Handler.dispatchMessage(Handler.java:100)  
    at android.os.Looper.loopOnce(Looper.java:249)  
    at android.os.Looper.loop(Looper.java:337)  
    at android.app.ActivityThread.main(ActivityThread.java:9593)
```

Claude analyzed it correctly at first. `DiscountCodeDialog.onAttach()` expected the ==host== to implement `DiscountCodeDialogListener`. The dialog was being shown from `PersonalAreaFragmentNew` via `childFragmentManager`, but that fragment did not implement the listener, so the attach check failed and threw. ==The working callers== ==did== implement the listener.

==wtf is working callers?==
==did or didn't?==
==also, why no description of bug and just a stack trace without any context?==

Then came the first proposed fix.

The idea was essentially this:

```kotlin
override fun onAttach(context: Context) {  
    super.onAttach(context)  
    listener = when {  
        parentFragment is DiscountCodeDialogListener ->  
            parentFragment as DiscountCodeDialogListener  
        else -> null   // instead of throwing  
    }  
}
```

==Claude's fix is to silently ignore exception?==

The argument was simple: the callback was already nullable, the dialog already used a safe call, so if no listener existed, the crash would disappear and the dialog would still “work.” That is almost exactly what Claude proposed: stop throwing, leave the listener `null`, and continue.

This was the wrong fix.

It removed the exception, but it also removed the contract. In a ==legacy project==, that is exactly where trouble starts. The code may look clumsy, but the callback often exists for a reason.

==why is it relevant that it's a legacy project? is it okay to suppress exceptions in a non-legacy one?==

So instead of accepting the first patch, I checked what the ==working callers== actually did in `onDiscountCodeDialogDismissed()`. That changed the whole picture. One fragment reloaded wallet data. Another showed a ==snackbar== with the credit value. In other words, ==dismissing the dialog== was not just a UI event. It could trigger important follow-up behavior.

==burying the lead? bug details without context, feels like a brief description of the bug was deleted from the beginning of the post==

That meant the proposed “fix” was really this: if the ==host== does not implement the listener, silently skip the post-dismiss behavior.

In this particular ==flow==, that would introduce a new bug. The ==coupon== could be redeemed through the ==deep link flow==, the ==crash would disappear==, but the personal area would not refresh properly afterward. So the patch would convert a ==visible failure== into a ==hidden functional regression==.

The correct fix was not to ==weaken the dialog==. The correct fix was to make `PersonalAreaFragmentNew` implement `DiscountCodeDialogListener` and perform the same refresh logic it already used elsewhere:

```kotlin
class PersonalAreaFragmentNew : Fragment(), DiscountCodeDialogListener {  
  override fun onDiscountCodeDialogDismissed() {  
        viewModel.refreshUserDetails()  
        viewModel.reloadPersonalData()  
    }  
}
```

That was the direction Claude eventually arrived at after I pushed it to inspect the existing `onDismiss` implementations instead of optimizing only for crash removal.

This is the actual lesson.

=="same refresh logic it already used elsewhere" - curious if these two lines are copy-pasted in 2+ locations==

A stack trace tells you where execution failed. It does not tell you why the code was written that way. Strong coding models can produce a patch that is locally coherent, syntactically clean, and still semantically wrong. In practice, the dangerous fixes are often the small ones: replacing a hard failure with `null`, a no-op, or a “graceful” fallback.

==sounds "duh" to me, actually I'm surprised that Claude was so incompetent as to suggest a fix that "unplugs the red blinking LED light"==

That is why I no longer trust the first AI fix for a crash when it ==weakens an invariant==. If the solution is “==just stop enforcing this==,” that is the moment to slow down and inspect what behavior the code was protecting.

In my case, the exception was unpleasant, but informative. The real bug was not “there is a throw in `onAttach()`.” The real bug was that a fragment hosting the dialog did not implement a contract that other flows relied on. Removing the throw would only hide that mismatch. Implementing the contract fixed both the crash and the feature.

So the real question was not “==how do I remove this stack trace.==” It was “what behavior disappears if I do.”

==who the hell does this lol==

That is still where engineering judgment matters more than the first AI answer.

==here's an idea - add a bonus section or a follow-up post with an experiment "here's what I changed in Claude prompt to try and make it find the root cause without handholding, and what it ended up doing"==