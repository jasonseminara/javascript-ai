davis_putnam = (atoms) ->
  pure_literals =[]
  V = arguments.atoms


  alert x for x in atoms
  S  
  dp1 = (atoms,S,V) ->
    S
  propagate = (A,S,V) ->
    C for C in S
     #  if ((A in C and V[A]=TRUE) or (~A in C and V[A]==FALSE))
     #  then delete C from S
     # else if (A in C and V[A]==FALSE) then delete A from C
     # else if (~A in C and V[A]==TRUE) then delete ~A from C;
    
  del = (clause, item) ->
   clause

  obvious_assign =( l,V )->
    wew