function Card({ className, children} : {children: React.ReactNode, className: string}) {
    return (<div className={className}>
    {children}
    </div>)
}

function CardTitle({className, children} : {className: string, children: React.ReactNode}) {
    return (<>
        <h3 className={className}>{children}</h3>
    </>)
}

function CardIcon({children} : {children: React.ReactNode}) {
    return (<>{children}</>)
}

function CardData({className, children} : {className?: string, children: React.ReactNode}) {
    return (<span className={className}>{children}</span>)
}

Card.Title = CardTitle
Card.Icon = CardIcon
Card.Data = CardData

export default Card