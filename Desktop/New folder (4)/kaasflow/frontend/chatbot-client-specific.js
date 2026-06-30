// CLIENT-SPECIFIC QUERY HANDLER
// Enhances chatbot to answer specific questions about individual clients, amounts, due payments, etc.

function enhanceClientSpecificQueries(message, clients, loans, payments) {
  const lowerMessage = message.toLowerCase();
  const today = new Date().toISOString().split('T')[0];
  
  // ========== CLIENT NAME QUERIES ==========
  
  // Extract client name from question - EXACT MATCH FIRST
  const extractClientName = (msg) => {
    const lowerMsg = msg.toLowerCase();
    
    // Try exact client name matches first
    for (let client of clients) {
      const clientNameLower = client.name.toLowerCase();
      if (lowerMsg.includes(clientNameLower)) {
        return client;
      }
    }
    
    // Try partial name match
    const cleanMsg = msg.replace(/how much|what is|show me|tell me|about|client|customer|loan|payment|due|remaining|total|balance|emi|when|does|have|owe|pending|amount|of|the/gi, '').trim();
    for (let client of clients) {
      if (cleanMsg.toLowerCase().includes(client.name.toLowerCase())) {
        return client;
      }
    }
    return null;
  };
  
  const client = extractClientName(lowerMessage);
  
  // ========== IF SPECIFIC CLIENT NAME FOUND - RETURN THEIR DETAILS ONLY ==========
  
  if (client) {
    // Get all data for this client
    const clientLoans = loans.filter(l => l.clientId === client.id);
    const clientPayments = payments.filter(p => {
      const loan = loans.find(l => l.id === p.loanId);
      return loan && loan.clientId === client.id;
    });
    
    const clientPaid = clientPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const clientPending = clientPayments.filter(p => p.status === 'pending').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const clientOverdue = clientPayments.filter(p => p.status === 'pending' && p.dueDate && p.dueDate < today);
    const overdueAmount = clientOverdue.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    
    // Determine what the user is asking about this specific client
    if (lowerMessage.includes('balance') || lowerMessage.includes('remaining') || lowerMessage.includes('owe') || lowerMessage.includes('how much') || lowerMessage.includes('amount')) {
      // Show ONLY this client's balance
      let response = `👤 **${client.name}**\n📞 ${client.phone || 'No phone'}\n\n`;
      
      if (clientLoans.length === 0) {
        return response + `❌ No loans found.\n\n💡 Create a loan in **Loans** tab.`;
      }
      
      clientLoans.forEach((loan, i) => {
        const principal = parseFloat(loan.principal) || 0;
        const rate = parseFloat(loan.interestRate) || 0;
        const duration = parseInt(loan.duration) || 1;
        
        let totalAmount = principal;
        if (loan.interestType === 'flat') {
          totalAmount = principal + rate;
        } else {
          totalAmount = principal + ((principal * rate * duration) / 100);
        }
        
        const loanPayments = payments.filter(p => p.loanId === loan.id);
        const paid = loanPayments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.amount), 0);
        const balance = totalAmount - paid;
        
        response += `**Loan ${i + 1}:** ${loan.type}\n`;
        response += `• Principal: ₹${principal.toLocaleString()}\n`;
        response += `• Total: ₹${totalAmount.toLocaleString()}\n`;
        response += `• Paid: ₹${paid.toLocaleString()}\n`;
        response += `• **Balance: ₹${balance.toLocaleString()}**\n`;
        response += `• Status: ${loan.status === 'active' ? '🟢 Active' : '✅ Completed'}\n\n`;
      });
      
      response += `💰 **Total Balance: ₹${clientPending.toLocaleString()}**`;
      if (overdueAmount > 0) {
        response += `\n⚠️ Overdue: ₹${overdueAmount.toLocaleString()}`;
      }
      return response;
    }
    
    if (lowerMessage.includes('due') || lowerMessage.includes('when') || lowerMessage.includes('next')) {
      // Show ONLY this client's due payments
      const upcomingPayments = clientPayments.filter(p => p.status === 'pending').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
      
      if (upcomingPayments.length === 0) {
        return `👤 **${client.name}**\n\n✅ No pending payments!`;
      }
      
      let response = `👤 **${client.name}** - Due Payments\n\n`;
      
      upcomingPayments.forEach((p, i) => {
        const isOverdue = p.dueDate && p.dueDate < today;
        const daysLate = isOverdue ? Math.floor((new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
        
        response += `${i + 1}. ₹${parseFloat(p.amount).toLocaleString()}\n`;
        response += `   Due: ${p.dueDate || 'Not set'}`;
        if (isOverdue) response += ` ⚠️ (${daysLate} days overdue)`;
        response += `\n\n`;
      });
      
      response += `📞 ${client.phone || 'No phone'}`;
      return response;
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('history') || lowerMessage.includes('paid')) {
      // Show ONLY this client's payment history
      if (clientPayments.length === 0) {
        return `👤 **${client.name}**\n\n❌ No payment history.`;
      }
      
      let response = `👤 **${client.name}** - Payment History\n\n`;
      response += `Total Payments: ${clientPayments.length}\n`;
      response += `Paid: ₹${clientPaid.toLocaleString()}\n`;
      response += `Pending: ₹${clientPending.toLocaleString()}\n\n`;
      
      const recent = clientPayments.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 10);
      recent.forEach((p, i) => {
        response += `${i + 1}. ₹${parseFloat(p.amount).toLocaleString()} - ${p.status === 'paid' ? '✅ Paid' : '⏳ Pending'} (${p.date || p.dueDate || 'No date'})\n`;
      });
      
      return response;
    }
    
    if (lowerMessage.includes('overdue') || lowerMessage.includes('late')) {
      // Show ONLY this client's overdue payments
      if (clientOverdue.length === 0) {
        return `👤 **${client.name}**\n\n✅ No overdue payments!`;
      }
      
      let response = `👤 **${client.name}** - Overdue Payments\n\n`;
      response += `⚠️ **${clientOverdue.length} overdue**\n`;
      response += `Amount: ₹${overdueAmount.toLocaleString()}\n\n`;
      
      clientOverdue.forEach((p, i) => {
        const daysLate = Math.floor((new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24));
        response += `${i + 1}. ₹${parseFloat(p.amount).toLocaleString()} (${daysLate} days late)\n`;
      });
      
      response += `\n📞 ${client.phone || 'No phone'}`;
      return response;
    }
    
    // DEFAULT: Show complete client summary
    let response = `👤 **${client.name}**\n📞 ${client.phone || 'No phone'}\n🏠 ${client.address || 'No address'}\n\n`;
    response += `**Financial Summary:**\n`;
    response += `• Loans: ${clientLoans.length}\n`;
    response += `• Total Lent: ₹${clientLoans.reduce((s, l) => s + (parseFloat(l.principal) || 0), 0).toLocaleString()}\n`;
    response += `• Total Paid: ₹${clientPaid.toLocaleString()}\n`;
    response += `• **Pending: ₹${clientPending.toLocaleString()}**\n`;
    
    if (clientOverdue.length > 0) {
      response += `• ⚠️ Overdue: ₹${overdueAmount.toLocaleString()} (${clientOverdue.length} payments)\n`;
    }
    
    response += `\n💡 Ask me:\n• "How much does ${client.name} owe?"\n• "When is ${client.name}'s next payment?"\n• "${client.name}'s payment history"`;
    return response;
  }
  
  // ========== WHO NEEDS TO PAY QUERIES ==========
  
  if (lowerMessage.includes('who') && (lowerMessage.includes('pay') || lowerMessage.includes('due') || lowerMessage.includes('pending'))) {
    
    // Extract amount if mentioned (e.g., "who owes 50000")
    const amountMatch = message.match(/[\d,]+/);
    const queryAmount = amountMatch ? parseFloat(amountMatch[0].replace(/,/g, '')) : null;
    
    // Who has specific amount pending
    if (queryAmount) {
      const matchingClients = [];
      clients.forEach(client => {
        const clientPayments = payments.filter(p => {
          const loan = loans.find(l => l.id === p.loanId);
          return loan && loan.clientId === client.id && p.status === 'pending';
        });
        const clientPending = clientPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
        
        // Check if amount matches (within 10% range)
        if (clientPending >= queryAmount * 0.9 && clientPending <= queryAmount * 1.1) {
          matchingClients.push({
            name: client.name,
            phone: client.phone,
            amount: clientPending,
            payments: clientPayments.length
          });
        }
      });
      
      if (matchingClients.length === 0) {
        return `❌ No clients found with pending amount around ₹${queryAmount.toLocaleString()}.`;
      }
      
      let response = `💰 **Clients with ~₹${queryAmount.toLocaleString()} pending:**\n\n`;
      matchingClients.slice(0, 10).forEach((c, i) => {
        response += `${i + 1}. **${c.name}** - ₹${c.amount.toLocaleString()}\n`;
        response += `   📞 ${c.phone || 'No phone'} | ${c.payments} payment${c.payments > 1 ? 's' : ''}\n\n`;
      });
      
      return response;
    }
    
    // Who needs to pay today
    if (lowerMessage.includes('today') || lowerMessage.includes('இன்று')) {
      const todayDue = [];
      clients.forEach(client => {
        const clientPayments = payments.filter(p => {
          const loan = loans.find(l => l.id === p.loanId);
          return loan && loan.clientId === client.id && p.status === 'pending' && p.dueDate === today;
        });
        
        if (clientPayments.length > 0) {
          const amount = clientPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
          todayDue.push({
            name: client.name,
            phone: client.phone,
            amount: amount,
            payments: clientPayments.length
          });
        }
      });
      
      if (todayDue.length === 0) {
        return `✅ **No payments due today!**\n\nAll clients are on track.`;
      }
      
      let response = `📅 **Payments Due Today:**\n\n`;
      todayDue.forEach((c, i) => {
        response += `${i + 1}. **${c.name}** - ₹${c.amount.toLocaleString()}\n`;
        response += `   📞 ${c.phone || 'No phone'}\n\n`;
      });
      
      return response;
    }
    
    // Who has overdue payments
    if (lowerMessage.includes('overdue') || lowerMessage.includes('late') || lowerMessage.includes('missed')) {
      const overdueClients = [];
      clients.forEach(client => {
        const clientOverdue = payments.filter(p => {
          const loan = loans.find(l => l.id === p.loanId);
          return loan && loan.clientId === client.id && p.status === 'pending' && p.dueDate && p.dueDate < today;
        });
        
        if (clientOverdue.length > 0) {
          const amount = clientOverdue.reduce((s, p) => s + parseFloat(p.amount), 0);
          const oldestDate = clientOverdue.reduce((oldest, p) => p.dueDate < oldest ? p.dueDate : oldest, today);
          const daysLate = Math.floor((new Date() - new Date(oldestDate)) / (1000 * 60 * 60 * 24));
          
          overdueClients.push({
            name: client.name,
            phone: client.phone,
            amount: amount,
            payments: clientOverdue.length,
            daysLate: daysLate
          });
        }
      });
      
      if (overdueClients.length === 0) {
        return `✅ **No overdue payments!**\n\nExcellent collection management!`;
      }
      
      // Sort by amount (highest first)
      overdueClients.sort((a, b) => b.amount - a.amount);
      
      let response = `⚠️ **Clients with Overdue Payments:**\n\n`;
      overdueClients.slice(0, 10).forEach((c, i) => {
        response += `${i + 1}. **${c.name}** - ₹${c.amount.toLocaleString()}\n`;
        response += `   📞 ${c.phone || 'No phone'}\n`;
        response += `   ⏰ ${c.payments} payment${c.payments > 1 ? 's' : ''} (${c.daysLate} days late)\n\n`;
      });
      
      return response;
    }
    
    // Who needs to pay (general pending)
    const pendingClients = [];
    clients.forEach(client => {
      const clientPending = payments.filter(p => {
        const loan = loans.find(l => l.id === p.loanId);
        return loan && loan.clientId === client.id && p.status === 'pending';
      });
      
      if (clientPending.length > 0) {
        const amount = clientPending.reduce((s, p) => s + parseFloat(p.amount), 0);
        pendingClients.push({
          name: client.name,
          phone: client.phone,
          amount: amount,
          payments: clientPending.length
        });
      }
    });
    
    if (pendingClients.length === 0) {
      return `✅ **All payments collected!**\n\nNo pending payments.`;
    }
    
    // Sort by amount (highest first)
    pendingClients.sort((a, b) => b.amount - a.amount);
    
    let response = `💳 **Clients with Pending Payments:**\n\n`;
    pendingClients.slice(0, 15).forEach((c, i) => {
      response += `${i + 1}. **${c.name}** - ₹${c.amount.toLocaleString()}\n`;
      response += `   📞 ${c.phone || 'No phone'} | ${c.payments} payment${c.payments > 1 ? 's' : ''}\n\n`;
    });
    
    if (pendingClients.length > 15) {
      response += `... and ${pendingClients.length - 15} more clients`;
    }
    
    return response;
  }
  
  // ========== TOTAL AMOUNT QUERIES ==========
  
  if (lowerMessage.includes('total amount') || lowerMessage.includes('total pending') || lowerMessage.includes('total due')) {
    const totalPending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalOverdue = payments.filter(p => p.status === 'pending' && p.dueDate && p.dueDate < today).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalLoaned = loans.reduce((s, l) => s + (parseFloat(l.principal) || 0), 0);
    
    return `💰 **Total Amounts:**\n\n**📊 Overview:**\n• Total Loaned: ₹${totalLoaned.toLocaleString()}\n• Total Collected: ₹${totalPaid.toLocaleString()}\n• **Total Pending: ₹${totalPending.toLocaleString()}**\n• Total Overdue: ₹${totalOverdue.toLocaleString()}\n\n**📈 Progress:**\n• Collection Rate: ${totalLoaned > 0 ? Math.round((totalPaid / totalLoaned) * 100) : 0}%\n• Outstanding: ${totalLoaned > 0 ? Math.round((totalPending / totalLoaned) * 100) : 0}%`;
  }
  
  // ========== CLIENT AMOUNT QUERIES ==========
  
  if (lowerMessage.includes('client amount') || lowerMessage.includes('client pending') || lowerMessage.includes('client balance')) {
    const clientAmounts = [];
    clients.forEach(client => {
      const clientLoans = loans.filter(l => l.clientId === client.id);
      const clientPayments = payments.filter(p => {
        const loan = loans.find(l => l.id === p.loanId);
        return loan && loan.clientId === client.id;
      });
      
      const totalLent = clientLoans.reduce((s, l) => s + (parseFloat(l.principal) || 0), 0);
      const totalPaid = clientPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
      const totalPending = clientPayments.filter(p => p.status === 'pending').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
      
      if (totalLent > 0) {
        clientAmounts.push({
          name: client.name,
          phone: client.phone,
          lent: totalLent,
          paid: totalPaid,
          pending: totalPending
        });
      }
    });
    
    if (clientAmounts.length === 0) {
      return `❌ No clients with loans found.`;
    }
    
    // Sort by pending amount (highest first)
    clientAmounts.sort((a, b) => b.pending - a.pending);
    
    let response = `👥 **Client Amounts:**\n\n`;
    clientAmounts.slice(0, 10).forEach((c, i) => {
      response += `${i + 1}. **${c.name}**\n`;
      response += `   Lent: ₹${c.lent.toLocaleString()} | Paid: ₹${c.paid.toLocaleString()}\n`;
      response += `   **Pending: ₹${c.pending.toLocaleString()}**\n`;
      response += `   📞 ${c.phone || 'No phone'}\n\n`;
    });
    
    if (clientAmounts.length > 10) {
      response += `... and ${clientAmounts.length - 10} more clients`;
    }
    
    return response;
  }
  
  // ========== SPECIFIC CLIENT QUERIES ==========
  
  if (!client) return null; // No specific client found
  
  // Get all data for this client
  const clientLoans = loans.filter(l => l.clientId === client.id);
  const clientPayments = payments.filter(p => {
    const loan = loans.find(l => l.id === p.loanId);
    return loan && loan.clientId === client.id;
  });
  
  const clientPaid = clientPayments.filter(p => p.status === 'paid').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const clientPending = clientPayments.filter(p => p.status === 'pending').reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const clientOverdue = clientPayments.filter(p => p.status === 'pending' && p.dueDate && p.dueDate < today);
  
  // BALANCE/REMAINING QUERIES
  if (lowerMessage.includes('balance') || lowerMessage.includes('remaining') || lowerMessage.includes('owe') || lowerMessage.includes('how much') || lowerMessage.includes('amount')) {
    let response = `👤 **${client.name}**\n📞 ${client.phone || 'No phone'}\n\n`;
    
    if (clientLoans.length === 0) {
      return response + `❌ No loans found.\n\n💡 Create a loan in **Loans** tab.`;
    }
    
    clientLoans.forEach((loan, i) => {
      const principal = parseFloat(loan.principal) || 0;
      const rate = parseFloat(loan.interestRate) || 0;
      const duration = parseInt(loan.duration) || 1;
      
      let totalAmount = principal;
      if (loan.interestType === 'flat') {
        totalAmount = principal + rate;
      } else {
        totalAmount = principal + ((principal * rate * duration) / 100);
      }
      
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const paid = loanPayments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.amount), 0);
      const balance = totalAmount - paid;
      
      response += `\n**Loan ${i + 1}:** ${loan.type}\n`;
      response += `• Principal: ₹${principal.toLocaleString()}\n`;
      response += `• Total: ₹${totalAmount.toLocaleString()}\n`;
      response += `• Paid: ₹${paid.toLocaleString()}\n`;
      response += `• **Balance: ₹${balance.toLocaleString()}**\n`;
      response += `• Status: ${loan.status === 'active' ? '🟢 Active' : '✅ Completed'}\n`;
    });
    
    response += `\n💰 **Total Balance: ₹${clientPending.toLocaleString()}**`;
    if (clientOverdue.length > 0) {
      const overdueAmount = clientOverdue.reduce((s, p) => s + parseFloat(p.amount), 0);
      response += `\n⚠️ Overdue: ₹${overdueAmount.toLocaleString()} (${clientOverdue.length} payments)`;
    }
    return response;
  }
  
  // DUE DATE QUERIES
  if (lowerMessage.includes('due') || lowerMessage.includes('when') || lowerMessage.includes('next payment')) {
    const upcomingPayments = clientPayments.filter(p => p.status === 'pending').sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
    
    if (upcomingPayments.length === 0) {
      return `👤 **${client.name}**\n\n✅ No pending payments!`;
    }
    
    let response = `👤 **${client.name}** - Due Payments\n\n`;
    
    upcomingPayments.slice(0, 5).forEach((p, i) => {
      const isOverdue = p.dueDate && p.dueDate < today;
      const daysLate = isOverdue ? Math.floor((new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24)) : 0;
      
      response += `${i + 1}. ₹${parseFloat(p.amount).toLocaleString()}\n`;
      response += `   Due: ${p.dueDate || 'Not set'}`;
      if (isOverdue) response += ` ⚠️ (${daysLate} days overdue)`;
      response += `\n\n`;
    });
    
    response += `📞 ${client.phone || 'No phone'}`;
    return response;
  }
  
  // PAYMENT HISTORY
  if (lowerMessage.includes('payment') || lowerMessage.includes('history') || lowerMessage.includes('paid')) {
    if (clientPayments.length === 0) {
      return `👤 **${client.name}**\n\n❌ No payment history.`;
    }
    
    let response = `👤 **${client.name}** - Payments\n\n`;
    response += `Total: ${clientPayments.length}\n`;
    response += `Paid: ₹${clientPaid.toLocaleString()}\n`;
    response += `Pending: ₹${clientPending.toLocaleString()}\n\n`;
    
    const recent = clientPayments.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 5);
    recent.forEach((p, i) => {
      response += `${i + 1}. ₹${parseFloat(p.amount).toLocaleString()} - ${p.status === 'paid' ? '✅' : '⏳'} (${p.date || p.dueDate || 'No date'})\n`;
    });
    
    return response;
  }
  
  // OVERDUE
  if (lowerMessage.includes('overdue') || lowerMessage.includes('late')) {
    if (clientOverdue.length === 0) {
      return `👤 **${client.name}**\n\n✅ No overdue payments!`;
    }
    
    const overdueAmount = clientOverdue.reduce((s, p) => s + parseFloat(p.amount), 0);
    let response = `👤 **${client.name}** - Overdue\n\n`;
    response += `⚠️ **${clientOverdue.length} overdue**\n`;
    response += `Amount: ₹${overdueAmount.toLocaleString()}\n\n`;
    
    clientOverdue.slice(0, 5).forEach((p, i) => {
      const daysLate = Math.floor((new Date() - new Date(p.dueDate)) / (1000 * 60 * 60 * 24));
      response += `${i + 1}. ₹${parseFloat(p.amount).toLocaleString()} (${daysLate} days late)\n`;
    });
    
    response += `\n📞 ${client.phone || 'No phone'}`;
    return response;
  }
  
  // DEFAULT CLIENT INFO
  return `👤 **${client.name}**\n📞 ${client.phone || 'No phone'}\n\n**Summary:**\n• Loans: ${clientLoans.length}\n• Paid: ₹${clientPaid.toLocaleString()}\n• Remaining: ₹${clientPending.toLocaleString()}\n${clientOverdue.length > 0 ? `\n⚠️ ${clientOverdue.length} overdue` : ''}\n\n💡 Ask me:\n• "How much does ${client.name} owe?"\n• "When is ${client.name}'s next payment?"\n• "${client.name}'s payment history"`;
}

console.log('✅ Enhanced Client-Specific Query Handler Loaded - Now supports amounts, due queries, and more!');
